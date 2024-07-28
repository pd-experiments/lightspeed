import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { ClipSearchResult } from "@/lib/types/customTypes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase.rpc("fetch_random_clips");

    if (error) {
      throw error;
    }

    const formattedData: ClipSearchResult[] = data.map((item: any) => ({
      id: item.video_uuid,
      video_uuid: item.video_uuid,
      video_id: item.video_id,
      title: item.title,
      description: item.description,
      start_timestamp: item.start_timestamp,
      end_timestamp: item.end_timestamp,
      text: item.text,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching random clips:", error);
    res.status(500).json({ error: "Failed to fetch random clips" });
  }
}