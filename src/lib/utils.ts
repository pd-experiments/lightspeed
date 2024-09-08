import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { openai_client } from "./openai-client";
import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getEmbedding(query: string): Promise<number[]> {
  const embedding: CreateEmbeddingResponse =
    await openai_client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
  return embedding.data[0].embedding;
}

export const RelevanceScoreSchema = z.object({
  relevanceScore: z.number(),
});
