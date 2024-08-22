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

  const { advertiser_url, start, offset } = req.body;

  console.log(advertiser_url);

  if (!advertiser_url) {
    res.status(500).json({ error: "Advertiser url is invalid" });
  }

  try {
    const { data, error } = await supabase
      .from("int_ads__google_ads_enhanced")
      .select("*")
      .eq("advertiser_url", advertiser_url)
      .order("last_shown", { ascending: false })
      .order("first_shown", { ascending: false })
      .range(start, start + offset - 1)
      .returns<EnhancedGoogleAd[]>();

    if (error) throw error;

    res.status(200).json({ ads: data });
  } catch (error) {
    console.error("Error fetching Google ads:", error);
    res.status(500).json({ error: "Error fetching Google ads" });
  }
}
