import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";
import { NextApiRequest, NextApiResponse } from "next";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const { query, start, offset } = req.body;
  
    try {
      let queryBuilder = supabase
        .from("int_ads__google_ads_enhanced")
        .select("*", { count: "exact" })
        .eq("format", "Video")
        .order("last_shown", { ascending: false })
        .order("first_shown", { ascending: false });
  
      if (query) {
        queryBuilder = queryBuilder.textSearch('content', query);
      }
  
      const { data, error, count } = await queryBuilder
        .range(start, start + offset - 1)
        .returns<EnhancedGoogleAd[]>();
  
      if (error) throw error;
  
      res.status(200).json({ ads: data, total: count });
    } catch (error) {
      console.error("Error fetching Google ads:", error);
      res.status(500).json({ error: "Error fetching Google ads" });
    }
  }
