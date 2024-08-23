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

  try {
    // Fetch all outlines
    const { data: outlines } = await supabase
      .from("outline")
      .select("*")
      .returns<Outline>();
    return res.status(200).json({ outlines: outlines });
  } catch (error) {
    console.error("Error fetching outlines:", error);
    res.status(500).json({ error: "Failed to fetch outlines" });
  }
}
