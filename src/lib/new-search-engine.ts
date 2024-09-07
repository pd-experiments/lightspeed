import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { openai_client } from "./openai-client";
import { supabase } from "./supabaseClient";
import {
  PoliticalKeyword,
  PoliticalLeaning,
  PoliticalTone,
} from "./types/lightspeed-search";

async function getEmbedding(query: string): Promise<number[]> {
  const embedding: CreateEmbeddingResponse =
    await openai_client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
  return embedding.data[0].embedding;
}

// Main function to call the search RPC
export async function searchNews(
  query: string,
  keywords: PoliticalKeyword[],
  leanings: PoliticalLeaning[],
  tones: PoliticalTone[],
  alpha: number = 0.25,
  beta: number = 0.2,
  gamma: number = 0.1,
  delta: number = 0.35,
  epsilon: number = 0.1
) {
  try {
    // Get the embedding for the query string
    const embedding = await getEmbedding(query);

    // Call the Supabase RPC
    const { data, error } = await supabase.rpc("search_news_advanced", {
      _keywords: keywords,
      _embedding: embedding, // This should be a vector of floats
      _leaning: leanings,
      _tones: tones,
      _alpha: alpha, // Weight for keyword matches
      _beta: beta, // Weight for leaning matches
      _gamma: gamma, // Weight for tone matches
      _delta: delta, // Weight for embedding similarity
      _epsilon: epsilon, // Weight for date recency
    });

    // Handle errors
    if (error) {
      console.error("Error calling search RPC:", error);
      return [];
    }

    // Return the top 20 results
    return data.slice(0, 20); // Return only top 20 results
  } catch (error) {
    console.error("Error in searchNews function:", error);
    return [];
  }
}
