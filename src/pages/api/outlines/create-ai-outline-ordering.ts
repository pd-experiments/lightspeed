/*
This handler uses GPT to generate a list of possible ordering of outline elements given every clip + clip metadata.
*/

import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";
import { openai_client } from "@/lib/openai-client";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];
type YouTubeVideo = Database["public"]["Tables"]["youtube"]["Row"];

type GPTClipMetadata = {
  id: string;
  video_uuid: {
    title: string;
    description: string;
  };
};

async function get_ordering_two_calls(
  gpt_input_clips: GPTClipMetadata[]
): Promise<{ orderings: string[][] }> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "The following is a conversation with an AI assistant about possible ordering of video news clipping outline elements.",
    },
    {
      role: "user",
      content: `Given the following clips and their metadata, what are 3 possible unique orderings of the outline elements? For each ordering, explain the reasoning behind the ordering and then output the ordering as a list of the ids.\n\n${JSON.stringify(
        gpt_input_clips
      )}`,
    },
  ];

  const response = (
    await openai_client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.1,
    })
  ).choices[0].message.content;

  if (response === "") {
    throw new Error("No response from GPT");
  }

  const pre_structured_response = (
    await openai_client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.concat(
        { role: "assistant", content: response },
        {
          role: "user",
          content:
            'Given the reasoning above, output the orderings as the following json schema: {"orderings": [ one permutation of ids, another permutation of ids, ... ]}. Regardless of the reasoning, your response must follow this schema. Do not include Markdown or any other formatting. Each ordering must contain some permutation of all the ids. Each ordering must be unique.',
        }
      ),
      temperature: 0.1,
    })
  ).choices[0].message.content;

  if (!pre_structured_response) {
    throw new Error("No response from GPT");
  }

  const parsedResponse = JSON.parse(pre_structured_response);
  if (parsedResponse.orderings === undefined) {
    throw new Error("Parsed response does not have the expected structure.");
  }

  if (!Array.isArray(parsedResponse.orderings)) {
    throw new Error("Parsed response does not have the expected structure.");
  }

  return parsedResponse;
}

async function get_ordering_one_call(
  gpt_input_clips: GPTClipMetadata[]
): Promise<{ orderings: string[][] }> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "The following is a conversation with an AI assistant about possible ordering of video news clipping outline elements.",
    },
    {
      role: "user",
      content: `Given the following clips and their metadata, what are 3 possible unique orderings of the outline elements and your recommendations on what should go in between the consecutive clips? Output the orderings as the following json schema: {"orderings": [ [one permutation of ids, another permutation of ids, ...], [one permutation of ids, another permutation of ids, ...], ... ], "in_between": [ [str, str, ...], ...]}. The in_between section for each order should be a list that has one fewer element than the corresponding orderings list and should describe a good way to transition between the two clips. For context, the clips are from news videos, and we are helping the user create political ads. So these transition points should be generated with the big picture in mind. Regardless of the reasoning, your response must follow this schema. Do not include Markdown or any other formatting. Each ordering must contain some permutation of all the ids. Each ordering must be unique.\n\n${JSON.stringify(
        gpt_input_clips
      )}`,
    },
  ];

  const pre_structured_response = (
    await openai_client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.1,
    })
  ).choices[0].message.content;

  if (!pre_structured_response) {
    throw new Error("No response from GPT");
  }

  const parsedResponse = JSON.parse(pre_structured_response);
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
      .select("id, video_uuid (title, description)")
      .in("id", element_ids)
      .returns<GPTClipMetadata[]>();

    if (error) {
      throw error;
    }

    // Query OpenAI GPT to generate possible ordering of outline elements
    // const parsedResponse = await get_ordering_two_calls(gpt_input_clips);
    const parsedResponse = await get_ordering_one_call(gpt_input_clips);

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Error generating AI outline ordering:", error);
    res.status(500).json({ error: "Error generating AI outline ordering" });
  }
}
