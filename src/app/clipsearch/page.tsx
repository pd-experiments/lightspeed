"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import GlobalSearch from '@/components/GlobalSearch';
import * as CustomTypes from '@/lib/types/customTypes';
import debounce from "lodash.debounce";
import ReactPlayer from "react-player";
import { Database } from "@/lib/types/schema";

type Outline = Database['public']['Tables']['outline']['Row'];

export default function ClipSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomTypes.ClipSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMore, setShowMore] = useState<number | null>(null);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | null>(null);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    fetchOutlines();
    fetchRandomClips();
  }, []);

  const fetchOutlines = async () => {
    try {
      const response = await fetch("/api/outlines/get-all-outlines");
      const data = await response.json();
      setOutlines(data.outlines);
    } catch (error) {
      console.error("Error fetching outlines:", error);
    }
  };

  const debouncedGlobalSearch = useCallback(
    debounce(async (query: string) => {
      setIsSearching(true);
      try {
        const response = await fetch("/api/globalSemanticSearch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (!response.ok) throw new Error("Failed to perform global semantic search");
        const result = await response.json();
        setSearchResults(result);
      } catch (error) {
        console.error("Error performing global semantic search:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const fetchRandomClips = async () => {
    try {
      const response = await fetch("/api/random-videos-clip-search");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching random clips:", error);
    }
  };

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedGlobalSearch(e.target.value);
  };

  const addToOutline = async (item: CustomTypes.ClipSearchResult) => {
    if (!selectedOutlineId) {
      console.error("No outline selected");
      return;
    }
    try {
      const response = await fetch("/api/outlines/add-to-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineId: selectedOutlineId,
          clipData: item,
        }),
      });
      if (!response.ok) throw new Error("Failed to add to outline");
      console.log("Successfully added to outline");
    } catch (error) {
      console.error("Error adding to outline:", error);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Clip Search</h1>
          <p className="text-base text-gray-700 mb-6">Search for video content from across the country.</p>
          <GlobalSearch
            searchQuery={searchQuery}
            handleGlobalSearch={handleGlobalSearch}
            isSearching={isSearching}
            outlines={outlines}
            selectedOutlineId={selectedOutlineId}
            setSelectedOutlineId={setSelectedOutlineId}
            searchResults={searchResults}
            addToOutline={addToOutline}
            showMore={showMore}
            setShowMore={setShowMore}
            playerRef={playerRef}
          />
        </div>
      </main>
    </>
  );
}