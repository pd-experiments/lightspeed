import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";
import { OutlineElementWithVideoTitle } from "@/app/outline/page";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { elements } = req.body;

  try {
    const { error } = await supabase.from("outline_elements").upsert(elements);
    if (error) {
      throw error;
    }
    return res.status(200).json({ message: "Elements updated successfully" });
  } catch (error) {
    console.error("Error updating elements:", error);
    res.status(500).json({ error: "Error updating elements." });
  }
}