"use client";

import AdSearchCard from "@/components/research/adsearch/AdSearchCard";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PaginationComponent,
} from "@/components/ui/pagination";
import { getPlatformIcon } from "@/lib/helperUtils/create/utils";
import { Database } from "@/lib/types/schema";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

export default function AdSearchPage() {
  const [adSearchResults, setAdSearchResults] = useState<EnhancedGoogleAd[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const itemsPerPage = 9;

  const handlePageChange = (newPage: number | ((prevPage: number) => number)) => {
    setCurrentPage(newPage);
  };

  const loadSearchResults = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/research/adsearch/get-google-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          start: (page - 1) * itemsPerPage,
          offset: itemsPerPage,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to load ad search results");
      }
      const { ads, total } = await response.json();
      setAdSearchResults(ads);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error("Error loading ad search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSearchResults(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadSearchResults(1);
  };

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center">
        <div className="w-full max-w-[1500px] gap-6 flex flex-col">
          <header className="py-3 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Search through troves of siloed data! 
              </h1>
              <div className="flex flex-row items-center gap-2">
                {getPlatformIcon("TikTok", 6)}
                {getPlatformIcon("Threads", 6)}
                {getPlatformIcon("Facebook", 6)}
                {getPlatformIcon("Instagram Post", 6)}
              </div>
            </div>
          </header>

          <div className="flex flex-row items-center gap-2">
            <Input
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          
          <PaginationComponent currentPage={currentPage} totalPages={totalPages} setCurrentPage={handlePageChange} />
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div
                  key={index}
                  className="h-64 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adSearchResults.map((adSearchResult, idx) => (
                <AdSearchCard key={idx} adSearchResult={adSearchResult} />
              ))}
            </div>
          )}

          <PaginationComponent currentPage={currentPage} totalPages={totalPages} setCurrentPage={handlePageChange} />
        </div>
      </main>
    </Navbar>
  );
}