import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, ...updateFields } = req.body;

  console.log("updateFields:", updateFields);

  try {
    const { error } = await supabase
      .from("outline_elements")
      .update(updateFields)
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Element updated successfully" });
  } catch (error) {
    console.error("Error updating element:", error);
    res.status(500).json({ error: "Failed to update element" });
  }
}