import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { openai_client } from "@/lib/openai-client";

const CHUNK_SIZE = 5;

async function generateScriptChunk(context: any[], isFirstChunk: boolean, isLastChunk: boolean) {
    console.log(`Generating script chunk. isFirstChunk: ${isFirstChunk}, isLastChunk: ${isLastChunk}`);

    const systemPrompt = "You are an assistant helping to create a full video script for a political advertisement. Your task is to generate a professional, well-formatted script that can be used by political campaigns for making political ads.";
    const userPrompt = `Given the following outline context for a political advertisement:\n${JSON.stringify(context, null, 2)}\n\n
      Generate a part of the video script that incorporates these elements. The script should include:
      1. Narration or dialogue with speaker labels
      2. Visual descriptions in parentheses
      3. Transitions between scenes
      4. Any text overlays or graphics in brackets
      5. Background music or sound effect suggestions in all caps
  
      Some elements may already have existing script content. Incorporate and improve upon these existing scripts where available, and generate new content for missing parts. Ensure the script flows naturally and effectively conveys the political message.
  
      ${isFirstChunk ? "This is the beginning of the script. Start with a strong opening." : ""}
      ${isLastChunk ? "This is the end of the script. Conclude with a powerful message and call to action." : ""}
      ${!isFirstChunk && !isLastChunk ? "This is a middle part of the script. Ensure smooth transitions from the previous part and to the next part." : ""}
  
      Format the script professionally, including speaker labels, visual descriptions, and technical directions.`;
  
    const response = await openai_client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000
    });
  
    console.log("Script chunk generated successfully");
    return response.choices[0].message.content;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("Starting full script generation");
    if (req.method !== "POST") {
        console.log("Invalid method, expected POST");
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { outline_id } = req.body;
    console.log(`Generating full script for outline_id: ${outline_id}`);

    try {
        console.log("Fetching outline elements from Supabase");
        const { data: outlineElements, error } = await supabase
        .from("outline_elements")
        .select("*, youtube(title)")
        .eq("outline_id", outline_id)
        .order("position_start_time", { ascending: true });

        if (error) {
            console.error("Error fetching outline elements:", error);
            throw error;
        }

        console.log(`Found ${outlineElements.length} outline elements`);

        const context = outlineElements.map((el) => ({
            type: el.type,
            description: el.description,
            position: `${el.position_start_time} - ${el.position_end_time}`,
            video_title: el.youtube?.title,
            existing_script: el.script || null,
        }));

        const totalChunks = Math.ceil(context.length / CHUNK_SIZE);
        console.log(`Total chunks to process: ${totalChunks}`);
        const scriptChunks = [];

        for (let i = 0; i < context.length; i += CHUNK_SIZE) {
            console.log(`Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${totalChunks}`);
            const chunk = context.slice(i, i + CHUNK_SIZE);
            const isFirstChunk = i === 0;
            const isLastChunk = i + CHUNK_SIZE >= context.length;
            const scriptChunk = await generateScriptChunk(chunk, isFirstChunk, isLastChunk);
            scriptChunks.push(scriptChunk);

            // Update progress
            const progress = Math.round(((i + CHUNK_SIZE) / context.length) * 100);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            if (!apiUrl) {
                console.error("NEXT_PUBLIC_API_URL is not defined");
                throw new Error("API URL is not configured");
            }

            console.log(`Updating progress: ${progress}%`);

            await fetch(`${apiUrl}/api/outlines/update-script-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outline_id, progress: Math.min(progress, 100) }),
            });
        }

        console.log("All chunks processed, joining full script");
        const fullScript = scriptChunks.join("\n\n");

        console.log("Updating outline with full script in Supabase");
        await supabase
            .from("outline")
            .update({ 
                full_script: fullScript, 
                script_generation_progress: 100 
            })
            .eq("id", outline_id);

        console.log("Full script generation completed successfully");
        res.status(200).json({ fullScript });
    } catch (error) {
        console.error("Error generating full script:", error);
        res.status(500).json({ error: "Failed to generate full script" });
    }
}