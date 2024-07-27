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

  const { query } = req.body;

  try {
    const embeddingResponse = await openai_client.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { data: searchResults, error } = await supabase.rpc(
      "match_documents_grouped",
      {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 10,
      }
    );

    console.log(searchResults);

    if (error) {
      throw error;
    }

    if (searchResults && searchResults.length > 0) {
      res.status(200).json(searchResults);
    } else {
      res.status(404).json({ message: "No matching results found" });
    }
  } catch (error) {
    console.error("Error performing semantic search:", error);
    res.status(500).json({ error: "Failed to perform semantic search" });
  }
}
