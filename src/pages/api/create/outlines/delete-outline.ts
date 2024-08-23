import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Outline ID is required to delete the outline" });
  }

  try {
    const { error } = await supabase.from("outline").delete().eq("id", id);
    if (error) {
      throw error;
    }
    return res.status(200).json({ message: "Outline deleted successfully" });
  } catch (error) {
    console.error("Error deleting outline:", error);
    res.status(500).json({ error: "Failed to delete outline" });
  }
}