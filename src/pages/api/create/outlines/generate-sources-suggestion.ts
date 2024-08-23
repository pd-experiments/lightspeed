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

    const context = outlineElements.map(el => ({
      type: el.type,
      description: el.description,
      position: `${el.position_start_time} - ${el.position_end_time}`,
      video_title: el.youtube?.title
    }));

    const response = await openai_client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an assistant helping to find relevant sources for a political advertisement video." },
        { role: "user", content: `Given the following outline context for a political advertisement:\n${JSON.stringify(context, null, 2)}\n\nGenerate a list of potential sources from news, scholarly articles, and pop culture that can be used to contextualize or add additional content for the element at position ${currentElement.position_start_time} - ${currentElement.position_end_time}. Consider the flow and context of the entire outline. Focus on:
        1. Relevant news articles
        2. Academic or scholarly sources
        3. Pop culture references or examples
        4. Statistics or data from reputable sources
        5. Historical events or precedents

        Provide a brief explanation for each source on how it can be used in the video (e.g., as an overlay, graphic, or additional context).` }
      ],
      max_tokens: 300
    });

    const suggestion = response.choices[0].message.content;

    res.status(200).json({ suggestion });
  } catch (error) {
    console.error("Error generating sources suggestion:", error);
    res.status(500).json({ error: "Failed to generate sources suggestion" });
  }
}