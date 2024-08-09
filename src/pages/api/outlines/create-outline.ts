import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { Database } from "@/lib/types/schema";
import { OutlineStatusEnum } from "@/lib/types/customTypes";

type Outline = Database["public"]["Tables"]["outline"]["Row"];

// Get all outlines
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const outline: Outline = {
    ...req.body.outline,
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    status: OutlineStatusEnum.INITIALIZED,
  };

  try {
    const { error } = await supabase.from("outline").insert([outline]);
    if (error) {
      throw error;
    }
    return res.status(200).json({ message: "Outline added successfully" });
  } catch (error) {
    console.error("Error fetching outlines:", error);
    res.status(500).json({ error: "Failed to fetch outlines" });
  }
}
