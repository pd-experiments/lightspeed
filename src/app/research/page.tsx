"use client";

import { useState } from 'react';
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getPlatformIcon } from "@/lib/helperUtils/create/utils";
import UniversalSearchResults from "@/components/research/universalsearch/UniversalSearchResults";
import { SearchResults } from "@/lib/types/lightspeed-search";

export default function UniversalSearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/search-engine/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!response.ok) {
        throw new Error("Failed to perform search");
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center">
        <div className="w-full max-w-[1500px] gap-6 flex flex-col">
          <header className="py-3 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Search through troves of [previously] siloed data
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
              placeholder="Search across all platforms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>

          <UniversalSearchResults results={searchResults} isLoading={isLoading} />
        </div>
      </main>
    </Navbar>
  );
}