import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { openai_client } from "./openai-client";
import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RelevanceScoreSchema = z.object({
  relevanceScore: z.number(),
});
