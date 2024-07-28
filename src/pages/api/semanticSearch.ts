import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { openai_client } from "@/lib/openai-client";
import * as CustomTypes from '@/lib/types/customTypes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query, videoId } = req.body;

  try {
    const embeddingResponse = await openai_client.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { data: searchResults, error } = await supabase.rpc(
        "match_documents",
        {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 1,
            video_uuid_specific: videoId,
        }
    );

    if (error) {
      throw error;
    }

    if (searchResults && searchResults.length > 0) {
      res.status(200).json(searchResults[0]);
    } else {
      res.status(404).json({ message: "No matching results found" });
    }
  } catch (error) {
    console.error("Error performing semantic search:", error);
    res.status(500).json({ error: "Failed to perform semantic search" });
  }
}