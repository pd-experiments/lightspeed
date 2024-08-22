"use client";

import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Database } from "@/lib/types/schema";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

function formatDate(inputDate: string | null): string {
  if (inputDate === null) {
    return "Unknown date";
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Parse the input string into a Date object
  const date = new Date(inputDate);

  // Get the month, day, and year from the Date object
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  // Format the date as 'Mon DD, YYYY'
  return `${month} ${day}, ${year}`;
}

function AdSearchCard({
  adSearchResult,
}: {
  adSearchResult: EnhancedGoogleAd;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <a href={adSearchResult.advertiser_url || ""}>
            {adSearchResult.advertiser_name}
          </a>
        </CardTitle>
        <CardDescription>
          Ran from {formatDate(adSearchResult.first_shown)} to{" "}
          {formatDate(adSearchResult.last_shown)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <embed className="w-full" src={adSearchResult.content || ""} />
      </CardContent>
    </Card>
  );
}

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
    <>
      <Navbar />
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
    </>
  );
}
