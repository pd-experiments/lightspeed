/*
This handler uses GPT to generate a list of possible ordering of outline elements given every clip + clip metadata.
*/

import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";
import { assert } from "console";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];
type YouTubeVideo = Database["public"]["Tables"]["youtube"]["Row"];

type GPTClipMetadata = {
  id: string;
  video_uuid: {
    title: string;
    description: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get list of element ids
    const element_ids: string[] = req.body.element_ids;

    // Get list of GPTClipMetadata elements
    const { data: gpt_input_clips, error } = await supabase
      .from("outline_elements")
      .select("id, video_uuid (title, description)")
      .in("id", element_ids)
      .returns<GPTClipMetadata>();

    if (error) {
      throw error;
    }

    // const gptclips: GPTClipMetadata[] = [];
    // for (const element of elements) {
    //   const { data: clip, error } = await supabase
    //     .from("youtube")
    //     .select("title,description")
    //     .eq("id", element.video_uuid)
    //     .returns<{ title: string | null; description: string | null }>()
    //     .single();

    //   if (error) {
    //     throw error;
    //   }

    //   if (!clip) {
    //     throw new Error(`Clip with id ${element.video_uuid} not found`);
    //   }

    //   gptclips.push({ ...clip, id: element.video_uuid });
    // }

    return res.status(200).json({ gpt_input_clips });
  } catch (error) {
    console.error("Error fetching outline elements:", error);
    res.status(500).json({ error: "Failed to fetch outline elements" });
  }
}
