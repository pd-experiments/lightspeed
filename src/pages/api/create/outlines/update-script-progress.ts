import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { outline_id, progress } = req.body;

    try {
        const { error } = await supabase
            .from("outline")
            .update({ script_generation_progress: progress })
            .eq("id", outline_id);

        if (error) throw error;

        res.status(200).json({ message: "Progress updated successfully" });
    } catch (error) {
        console.error("Error updating script generation progress:", error);
        res.status(500).json({ error: "Failed to update progress" });
    }
}