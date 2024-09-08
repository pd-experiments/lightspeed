"use client";

import AdSearchCard from "@/components/research/adsearch/AdSearchCard";
import CardSkeleton from "@/components/research/adsearch/CardSkeleton";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/types/schema";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type GoogleAdvertiser =
  Database["public"]["Tables"]["int_ads__google_advertisers"]["Row"];
type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

export default function AdvertiserDetailsPage({
  params,
}: {
  params: { advertiser_id: string };
}) {
  const [advertiserData, setAdvertiserData] = useState<GoogleAdvertiser>();
  const [ads, setAds] = useState<EnhancedGoogleAd[]>([]);
  const [isLoadingAds, setLoadingAds] = useState<boolean>(true);
  const [queryStart, setQueryStart] = useState<number>(0);
  const [queryOffset, setQueryOffset] = useState<number>(10);

  useEffect(() => {
    const loadPageData = async () => {
      const { data, error } = await supabase
        .from("int_ads__google_advertisers")
        .select("*")
        .eq("advertiser_id", params.advertiser_id)
        .returns<GoogleAdvertiser>()
        .single();

      if (error) throw error;
      if (!data)
        throw new Error(`Advertiser id ${params.advertiser_id} not found`);

      setAdvertiserData(data);
    };

    setQueryStart(0);
    loadPageData();
  }, [params.advertiser_id]);

  const loadAdData = async () => {
    if (!advertiserData) return;
    const response = await fetch(
      "/api/research/adsearch/get-google-ads-for-advertiser",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advertiser_url: advertiserData.advertiser_url,
          start: queryStart,
          offset: queryOffset,
        }),
      }
    );
    const { ads, error } = await response.json();
    if (error) {
      throw error;
    }
    return ads;
  };

  const paginate = async () => {
    setLoadingAds(true);
    const response = await loadAdData();
    if (response) {
      setAds((old) => [...old, ...response]);
    }
    setLoadingAds(false);
    setQueryStart((prev) => prev + queryOffset);
  };
  useEffect(() => {
    const loadInitialData = async () => {
      setQueryStart(0);
      setLoadingAds(true);
      const response = await loadAdData();
      setAds(response || []);
      setLoadingAds(false);
      setQueryStart((prev) => prev + queryOffset);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserData]);

  return (
    advertiserData && (
      <Navbar>
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="w-full max-w-[1500px] gap-6 flex flex-col">
            {/* Title bar */}
            <div className="flex flex-row gap-4 justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-700">
                  {advertiserData.advertiser_id}
                </div>
                <h1 className="text-3xl font-bold">
                  {advertiserData.advertiser_name}
                </h1>
              </div>
              <Button asChild variant={"outline"} size={"sm"}>
                <a
                  className="flex flex-row gap-1"
                  target="_blank"
                  href={advertiserData.advertiser_url}
                  rel="noopener noreferrer"
                >
                  <div>View on Google Ad Transparency Center</div>
                  <ChevronRight className="-mr-2" />
                </a>
              </Button>
            </div>
            {/* Content */}
            <div className="grid grid-cols-3 gap-4 flex-wrap">
              {ads.map((ad, idx) => (
                <AdSearchCard key={idx} adSearchResult={ad} />
              ))}
            </div>
            {isLoadingAds && (
              <div className="flex flex-row gap-4 w-full">
                <CardSkeleton isLoading={isLoadingAds} />
                <CardSkeleton isLoading={isLoadingAds} />
                <CardSkeleton isLoading={isLoadingAds} />
              </div>
            )}

            {/* Paginate */}
            <div className="flex flex-row justify-center">
              <Button onClick={paginate}>Load more</Button>
            </div>
          </div>
        </main>
      </Navbar>
    )
  );
}
