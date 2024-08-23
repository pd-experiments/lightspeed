"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/ui/Navbar";
import YouTubeSearch from '@/components/YoutubeSearch';
import * as CustomTypes from '@/lib/types/customTypes';
import debounce from "lodash.debounce";
import { supabase } from "@/lib/supabaseClient";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/types/schema";
import { PaginatedDataTable } from "@/components/ui/paginated-data-table";
import { Row } from "@tanstack/react-table";

type Video = Database['public']['Tables']['youtube']['Row'];

export default function DirectoryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<CustomTypes.TranscriptItem[] | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentVideoUuid, setCurrentVideoUuid] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('youtube').select('*');
      if (error) throw error;
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally { 
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !currentVideoUuid) return;
      setIsSearching(true);
      try {
        const response = await fetch("/api/semanticSearch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, videoId: currentVideoUuid }),
        });
        if (!response.ok) throw new Error("Failed to perform semantic search");
        const result = await response.json();
        if (result && playerRef.current) {
          playerRef.current.seekTo(new Date(result.timestamp).getTime() / 1000, "seconds");
        }
      } catch (error) {
        console.error("Error performing semantic search:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [currentVideoUuid]
  );

  const displayTranscript = (transcript: CustomTypes.TranscriptItem[], videoId: string, video_uuid: string) => {
    setSelectedTranscript(transcript);
    setCurrentVideoId(videoId);
    setCurrentVideoUuid(video_uuid);
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTimestamp(state.playedSeconds);
  };

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Directory</h1>
          <p className="text-base text-gray-700 mb-6">A comprehensive database of videos, articles, and popular culture content from across the country.</p>
          {selectedTranscript && currentVideoId && (
            <YouTubeSearch
              currentVideoId={currentVideoId}
              selectedTranscript={selectedTranscript}
              currentTimestamp={currentTimestamp}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              debouncedSearch={debouncedSearch}
              handleProgress={handleProgress}
              playerRef={playerRef}
            />
          )}
          <PaginatedDataTable
            isLoading={isLoading}
            columns={[
              {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }: { row: Row<Video> }) => (
                  <a
                    href={`https://www.youtube.com/watch?v=${row.original.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row.original.title}
                  </a>
                ),
              },
              {
                accessorKey: "description",
                header: "Description",
              },
              {
                accessorKey: "published_at",
                header: "Published At",
              },
              {
                id: "actions",
                cell: ({ row }: { row: Row<Video> }) => (
                    <Button
                    onClick={() =>
                      displayTranscript(
                        Array.isArray(row.original.transcript) ? row.original.transcript as CustomTypes.TranscriptItem[] : [],
                        row.original.video_id ?? '',
                        row.original.id ?? ''
                      )
                    }
                  >
                    Search Transcript
                  </Button>
                ),
              },
            ]}
            data={videos}
            itemsPerPage={20}
          />
        </div>
      </main>
    </Navbar>
  );
}