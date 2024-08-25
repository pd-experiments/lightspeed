import { LightspeedSearch, NLPLightspeedSearch } from "@/lib/search-engine";
import {
  LightspeedSearchQuery,
  LightspeedSearchQuerySchema,
  SearchResults,
} from "@/lib/types/lightspeed-search";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // const query: LightspeedSearchQuery = req.body;
  const query: string = req.body.query;

  if (!query) {
    return res.status(500).json({ error: "Invalid search query format" });
  }

  try {
    // const results: SearchResults = await LightspeedSearch(query);
    const results = await NLPLightspeedSearch(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error executing search query:", error);
    res.status(500).json({ error: "Error executing search query" });
  }
}
