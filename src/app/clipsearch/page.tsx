"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import GlobalSearch from '@/components/GlobalSearch';
import * as CustomTypes from '@/lib/types/customTypes';
import debounce from "lodash.debounce";
import ReactPlayer from "react-player";
import { Database } from "@/lib/types/schema";
import { supabase } from "@/lib/supabaseClient"; 

type Outline = Database['public']['Tables']['outline']['Row'];

export default function ClipSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomTypes.ClipSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [showMore, setShowMore] = useState<number | null>(null);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | null>(null);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingPage(true);
      try {
        await Promise.all([fetchOutlines(), fetchRandomClips()]);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchInitialData();
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
      const { data: lastElement, error } = await supabase
      .from("outline_elements")
      .select("*")
      .eq("outline_id", selectedOutlineId)
      .order("position_end_time", { ascending: false })
      .limit(1)
      .single();

      const lastPositionEndTime = lastElement ? new Date(lastElement.position_end_time).getTime() : 0;
      const videoStartTime = new Date(item.start_timestamp).getTime();
      const videoEndTime = new Date(item.end_timestamp).getTime();
      const duration = videoEndTime - videoStartTime;
  
      const newPositionStartTime = new Date(lastPositionEndTime);
      const newPositionEndTime = new Date(lastPositionEndTime + duration);
  
      const element = {
        outline_id: selectedOutlineId,
        video_uuid: item.video_uuid,
        video_id: item.video_id,
        video_start_time: item.start_timestamp,
        video_end_time: item.end_timestamp,
        position_start_time: newPositionStartTime.toISOString(),
        position_end_time: newPositionEndTime.toISOString(),
        type: 'VIDEO',
        description: item.description,
      };
  
      const response = await fetch("/api/outlines/create-element", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(element),
      });
      if (!response.ok) throw new Error("Failed to add to outline");
      alert("Successfully added to outline");
    } catch (error) {
      console.error("Error adding to outline:", error);
    }
  };

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Clip Search</h1>
          <p className="text-base text-gray-700 mb-6">Search for video content from across the country.</p>
          <GlobalSearch
            isLoading={isLoadingPage}
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
    </Navbar>
  );
}