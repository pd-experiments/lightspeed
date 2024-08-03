import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";
import { openai_client } from "@/lib/openai-client";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];
type YouTubeVideo = Database["public"]["Tables"]["youtube"]["Row"];

type GPTClipMetadata = {
  id: string;
  video: {
    title: string;
    description: string;
  };
  clip_soundbite_text: string;
  duration: string;
};

async function get_ordering_one_call(
  gpt_input_clips: GPTClipMetadata[]
): Promise<{ orderings: string[][], timestamps: { id: string, start: string, end: string }[][] }> {
  const formattedClips = gpt_input_clips.map(clip => ({
    id: clip.id,
    title: clip.video.title,
    description: clip.video.description,
    clip_soundbite_text: clip.clip_soundbite_text,
    duration: clip.duration
  }));

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "The following is a conversation with an AI assistant about possible ordering of video news clipping outline elements.",
    },
    {
      role: "user",
      content: `Given the following clips and their metadata, generate 3 completely different and unique orderings of the outline elements. Each ordering must have unique timestamps and must not duplicate the current clip order or time spacing. Output the orderings as the following JSON schema: {"orderings": [ [one permutation of ids, another permutation of ids, ...], [one permutation of ids, another permutation of ids, ...], ... ], "in_between": [ [str, str, ...], ...], "timestamps": [ [ { "id": "clip_id", "start": "timestamp", "end": "timestamp" }, ... ], ... ]}. Each ordering must contain the same number of clips as provided in the input and must be unique (especially by timestamps, durations must be same, but you can add/remove time between videos as you please). The in_between section for each order should be a list that has one fewer element than the corresponding orderings list and should describe a good way to transition between the two clips. The orderings should not duplicate the current clip order or time spacing. You can return a longer duration of video by adding/reducing spaces between clips in the outline. For context, the clips are from news videos, and we are helping the user create political ads. So these transition points should be generated with the big picture in mind. Regardless of the reasoning, your response must follow this schema. Do not include Markdown or any other formatting. Ensure that the orderings are arrays of strings (clip IDs) only. The goal is to improve the current ordering by making it more engaging and coherent. It is crucial that each ordering and its timestamps are unique.\n\n${JSON.stringify(
        formattedClips
      )}`,
    },
  ];

  const pre_structured_response = (
    await openai_client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.6, // Increase temperature for more variety
    })
  ).choices[0].message.content;

  console.log(pre_structured_response)

  if (!pre_structured_response) {
    throw new Error("No response from GPT");
  }

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(pre_structured_response);
  } catch (error) {
    console.error("Error parsing GPT response:", pre_structured_response);
    throw new Error("Failed to parse GPT response");
  }

  if (parsedResponse.orderings === undefined) {
    throw new Error("Parsed response does not have the expected structure.");
  }

  if (!Array.isArray(parsedResponse.orderings)) {
    throw new Error(
      "Parsed response does not have the expected structure (orderings)."
    );
  }

  if (!Array.isArray(parsedResponse.in_between)) {
    throw new Error(
      "Parsed response does not have the expected structure (in_between)."
    );
  }

  if (!Array.isArray(parsedResponse.timestamps)) {
    throw new Error(
      "Parsed response does not have the expected structure (timestamps)."
    );
  }

  // Ensure each ordering has the same number of clips as the input
  const expectedLength = gpt_input_clips.length;
  parsedResponse.orderings.forEach((ordering: string[]) => {
    if (ordering.length !== expectedLength) {
      throw new Error("Ordering does not contain the expected number of clips.");
    }
  });

  return parsedResponse;
}

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
      .select("id, video_uuid, video_start_time, video_end_time")
      .in("id", element_ids)
      .returns<OutlineElement[]>();

    if (error) {
      throw error;
    }

    // Fetch the text from video_embeddings for each clip
    const gpt_input_clips_with_text = await Promise.all(
      gpt_input_clips.map(async (clip) => {
        const { data: embeddings, error: embeddingsError } = await supabase
          .from("video_embeddings")
          .select("text")
          .eq("video_uuid", clip.video_uuid)
          .gte("timestamp", clip.video_start_time)
          .lte("timestamp", clip.video_end_time);

        if (embeddingsError) {
          throw embeddingsError;
        }

        const combinedText = embeddings.map((e) => e.text).join(" ");
        const duration = new Date(clip.video_end_time ?? '').getTime() - new Date(clip.video_start_time ?? '').getTime();

        const { data: youtubeData, error: youtubeError } = await supabase
          .from("youtube")
          .select("title, description")
          .eq("id", clip.video_uuid)
          .single();

        if (youtubeError) {
          throw youtubeError;
        }

        return { 
          ...clip, 
          clip_soundbite_text: combinedText,
          duration: duration.toString(),
          video: {
            title: youtubeData.title,
            description: youtubeData.description
          }
        };
      })
    );

    // Query OpenAI GPT to generate possible ordering of outline elements
    const parsedResponse = await get_ordering_one_call(gpt_input_clips_with_text);

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Error generating AI outline ordering:", error);
    res.status(500).json({ error: "Error generating AI outline ordering" });
  }
}

/*
This handler uses GPT to generate a list of possible ordering of outline elements given every clip + clip metadata.
*/