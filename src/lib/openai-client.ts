import OpenAI from "openai";
import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";

export async function getEmbedding(query: string): Promise<number[]> {
  const embedding: CreateEmbeddingResponse =
    await openai_client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
  return embedding.data[0].embedding;
}

export const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // dangerouslyAllowBrowser: true,
});
