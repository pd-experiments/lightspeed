import { NextApiRequest, NextApiResponse } from "next";
import { processUserQuery } from "@/lib/new-search-engine";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const results = await processUserQuery(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error processing user query:", error);
    res.status(500).json({ error: "Error processing user query: " + error });
  }
}
