"use client";

import AdSearchCard from "@/components/adsearch/AdSearchCard";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database } from "@/lib/types/schema";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

export default function AdSearchPage() {
  const [adSearchResults, setAdSearchResults] = useState<EnhancedGoogleAd[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState<string>();
  const [queryStart, setQueryStart] = useState<number>(0);
  const [queryOffset, setQueryOffset] = useState<number>(20);

  const loadSearchResults = async () => {
    const response = await fetch("/api/adsearch/get-google-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
        start: queryStart,
        offset: queryOffset,
      }),
    });
    if (!response.ok) {
      console.error("Failed to load ad search results");
    }
    const { ads } = await response.json();
    return ads;
  };

  const newSearchResults = async () => {
    setQueryStart(0);
    const ads = await loadSearchResults();
    setAdSearchResults(ads);
    setQueryStart((old) => old + queryOffset);
  };

  const addSearchResults = async () => {
    const ads = await loadSearchResults();
    setAdSearchResults((currentAds) => [...currentAds, ...ads]);
    setQueryStart((old) => old + queryOffset);
  };

  useEffect(() => {
    newSearchResults();
  }, []);

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl gap-6 flex flex-col">
          <h1 className="text-3xl font-bold">Ad Search</h1>
          <p className="text-base text-gray-700">
            Search for recent political ads.
          </p>

          {/* Search bar */}
          <div className="flex flex-row items-center gap-2">
            <Input placeholder="Type to search" />
            <Button size="icon">
              <Search />
            </Button>
          </div>

          {/* Search results */}
          <div className="grid grid-cols-3 gap-4 flex-wrap">
            {adSearchResults.map((adSearchResult, idx) => (
              <AdSearchCard
                key={idx}
                adSearchResult={adSearchResult}
              ></AdSearchCard>
            ))}
          </div>

          {/* Paginate */}
          <div className="flex flex-row justify-center">
            <Button onClick={addSearchResults}>Load more</Button>
          </div>
        </div>
      </main>
    </Navbar>
  );
}
