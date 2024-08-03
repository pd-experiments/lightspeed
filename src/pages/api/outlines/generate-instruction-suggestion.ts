import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { openai_client } from "@/lib/openai-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { outline_id, element_id } = req.body;

  try {
    const { data: outlineElements, error } = await supabase
    .from("outline_elements")
    .select("*, youtube(title)")
    .eq("outline_id", outline_id)
    .order("position_start_time", { ascending: true });
  
    if (error) throw error;
    
    const currentElement = outlineElements.find(el => el.id === element_id);
    if (!currentElement) throw new Error("Element not found");
    
    const context = await Promise.all(outlineElements.map(async (el) => {
        const baseContext = {
        type: el.type,
        description: el.description,
        position: `${el.position_start_time} - ${el.position_end_time}`
        };
    
        if (el.type === 'VIDEO' && el.youtube) {
        return { ...baseContext, video_title: el.youtube.title };
        }
    
        return baseContext;
    }));

    const response = await openai_client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an assistant helping to create instructions for video editing." },
        { role: "user", content: `Given the following outline context for a political advertisement:\n${JSON.stringify(context, null, 2)}\n\nGenerate concise instructions for the video clip at position ${currentElement.position_start_time} - ${currentElement.position_end_time}. Focus on:
        1. Key information or text to overlay on the video
        2. Suggested sound effects or background music
        3. Visual effects or transitions to emphasize the message
        4. How to tie this clip into the overall narrative of the political ad
        5. Any specific political messaging or talking points to highlight
        
        Consider the flow and context of the entire outline when making your suggestions. Fit your response within 150 tokens.` }      
      ],
      max_tokens: 150
    });

    const suggestion = response.choices[0].message.content;

    res.status(200).json({ suggestion });
  } catch (error) {
    console.error("Error generating instruction suggestion:", error);
    res.status(500).json({ error: "Failed to generate instruction suggestion" });
  }
}