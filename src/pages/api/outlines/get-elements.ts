import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];

// Get all outlines
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { outline_id } = req.query;
  if (!outline_id) {
    return res
      .status(400)
      .json({ error: "Outline ID is required to fetch elements" });
  }

  try {
    // Fetch all outline elements for the given outline ID
    const { data: outlineElements } = await supabase
      .from("outline_elements")
      .select("*")
      .eq("outline_id", outline_id)
      .returns<OutlineElement>();
    return res.status(200).json(outlineElements);
  } catch (error) {
    console.error("Error fetching outline elements:", error);
    res.status(500).json({ error: "Failed to fetch outline elements" });
  }
}
