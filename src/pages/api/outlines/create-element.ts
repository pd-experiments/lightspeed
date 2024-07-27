import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];

// Get all outlines
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const element: OutlineElement = req.body;
  console.log(element);

  try {
    // Fetch all outline elements for the given outline ID
    const { error } = await supabase.from("outline_elements").insert(element);
    if (error) {
      throw error;
    }
    return res.status(200).json({ message: "Element added successfully" });
  } catch (error) {
    console.error("Error creating element for outline:", error);
    res.status(500).json({ error: "Error creating element for outline." });
  }
}
