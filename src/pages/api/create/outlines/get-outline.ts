import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";

type Outline = Database["public"]["Tables"]["outline"]["Row"];

// Get all outlines
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const outline_id = req.query.outline_id as string;

  if (!outline_id) {
    return res
      .status(400)
      .json({ error: "Outline ID is required to fetch the outline" });
  }

  try {
    // Fetch single outlines
    const { data: outline } = await supabase
      .from("outline")
      .select("*")
      .eq("id", outline_id)
      .returns<Outline>()
      .single();
    return res.status(200).json(outline);
  } catch (error) {
    console.error("Error fetching outlines:", error);
    res.status(500).json({ error: "Failed to fetch outlines" });
  }
}
