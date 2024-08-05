import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { openai_client } from "@/lib/openai-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { outline_id, element_id, script_element_start, script_element_end } = req.body;

  try {
    const { data: outlineElements, error } = await supabase
      .from("outline_elements")
      .select("*, youtube(title)")
      .eq("outline_id", outline_id)
      .order("position_start_time", { ascending: true });

    if (error) throw error;

    const currentElementIndex = outlineElements.findIndex(el => el.id === element_id);
    if (currentElementIndex === -1) throw new Error("Element not found");

    const currentElement = outlineElements[currentElementIndex];
    const previousElement = outlineElements[currentElementIndex - 1] || null;
    const nextElement = outlineElements[currentElementIndex + 1] || null;

    const fetchGroupedVideoEmbeddings = async (element: any) => {
      if (element.type !== "VIDEO") return null;
    
      const { data: videoEmbeddingsObjects, error } = await supabase
        .from("grouped_video_embeddings")
        .select("*")
        .eq("video_uuid", element.video_uuid);
    
      if (error) throw error;

      const filteredEmbeddingsObjects = videoEmbeddingsObjects.filter((embedding: any) => {
        const startTime = new Date(embedding.timestamp).getTime();
        const endTime = startTime + new Date(embedding.duration).getTime();
        const elementStartTime = new Date(element.video_start_time).getTime();
        const elementEndTime = new Date(element.video_end_time).getTime();
        return startTime >= elementStartTime && endTime <= elementEndTime;
      });
    
      return filteredEmbeddingsObjects.map((embedding) => embedding.text).join(" ");
    };

    const currentElementText = await fetchGroupedVideoEmbeddings(currentElement);
    const previousElementText = previousElement ? await fetchGroupedVideoEmbeddings(previousElement) : null;
    const nextElementText = nextElement ? await fetchGroupedVideoEmbeddings(nextElement) : null;

    const outlineDuration = calculateOutlineDuration(outlineElements);

    const context = {
      currentElement: {
        type: currentElement.type,
        description: currentElement.description,
        position: `${currentElement.position_start_time} - ${currentElement.position_end_time}`,
        script: currentElement.script,
        audio_in_the_clip: currentElementText,
      },
      previousElement: previousElement ? {
        type: previousElement.type,
        description: previousElement.description,
        position: `${previousElement.position_start_time} - ${previousElement.position_end_time}`,
        script: previousElement.script,
        audio_in_the_clip: previousElementText,
      } : null,
      nextElement: nextElement ? {
        type: nextElement.type,
        description: nextElement.description,
        position: `${nextElement.position_start_time} - ${nextElement.position_end_time}`,
        script: nextElement.script,
        audio_in_the_clip: nextElementText,
      } : null,
    };

    console.log("Context:", JSON.stringify(context, null, 2));

    const response = await openai_client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an assistant helping to create script elements for producing political advertisements." },
        { role: "user", content: `Given the following context for a ${outlineDuration} second political advertisement:\n${JSON.stringify(context, null, 2)}\n\nGenerate a suggestion for a new script element for the ${script_element_start} - ${script_element_end} time range. Consider the flow and context of the entire outline. These are not instructions for an editor, but rather dialogue for a potential narrator, AI voiceover, or multiple speakers. This is not a screenplay, only produce dialogue, be unique in relation to the existing script elements.` }
      ],
      max_tokens: 150
    });

    const suggestion = JSON.parse(response.choices[0].message.content || "{}");

    console.log("Suggestion:", JSON.stringify(suggestion, null, 2));
    console.log("Suggestion text:", suggestion.text);

    res.status(200).json({ suggestion });
  } catch (error) {
    console.error("Error generating script element suggestion:", error);
    res.status(500).json({ error: "Failed to generate script element suggestion" });
  }
}

function calculateOutlineDuration(outlineElements: any[]): number {
  if (outlineElements.length === 0) return 0;

  const startTime = new Date(outlineElements[0].position_start_time).getTime();
  const endTime = new Date(outlineElements[outlineElements.length - 1].position_end_time).getTime();

  return Math.round((endTime - startTime) / 1000);
}