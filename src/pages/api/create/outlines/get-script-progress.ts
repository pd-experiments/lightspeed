import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { outline_id } = req.query;

    try {
        const { data, error } = await supabase
            .from("outline")
            .select("script_generation_progress")
            .eq("id", outline_id)
            .single();

        if (error) throw error;

        res.status(200).json({ progress: data.script_generation_progress });
    } catch (error) {
        console.error("Error fetching script generation progress:", error);
        res.status(500).json({ error: "Failed to fetch progress" });
    }
}