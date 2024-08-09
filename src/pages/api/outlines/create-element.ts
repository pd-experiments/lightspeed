import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";

type OutlineElement = Database["public"]["Tables"]["outline_elements"]["Row"];

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
    const { data: outlineData, error: outlineError } = await supabase
      .from("outlines")
      .select("status")
      .eq("id", element.outline_id)
      .single();

    if (outlineError) throw outlineError;

    const { error: insertError } = await supabase.from("outline_elements").insert(element);
    if (insertError) throw insertError;

    if (outlineData.status === "INITIALIZED") {
      const { error: updateError } = await supabase
        .from("outlines")
        .update({ status: "EDITING" })
        .eq("id", element.outline_id);

      if (updateError) throw updateError;
    }

    return res.status(200).json({ message: "Element added successfully" });
  } catch (error) {
    console.error("Error creating element for outline:", error);
    res.status(500).json({ error: "Error creating element for outline." });
  }
}