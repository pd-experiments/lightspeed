import { NextApiRequest, NextApiResponse } from "next";
import { searchNews } from "@/lib/new-search-engine";
import {
  PoliticalKeyword,
  PoliticalLeaning,
  PoliticalTone,
} from "@/lib/types/lightspeed-search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    query,
    keywords,
    leanings,
    tones,
    alpha,
    beta,
    gamma,
    delta,
    epsilon,
  } = req.body;

  if (
    !query ||
    !Array.isArray(keywords) ||
    !Array.isArray(leanings) ||
    !Array.isArray(tones)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const results = await searchNews(
      query,
      keywords as PoliticalKeyword[],
      leanings as PoliticalLeaning[],
      tones as PoliticalTone[],
      alpha,
      beta,
      gamma,
      delta,
      epsilon
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error executing search query:", error);
    res.status(500).json({ error: "Error executing search query" });
  }
}
