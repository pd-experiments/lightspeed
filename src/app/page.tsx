'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import ReactPlayer from 'react-player';
import { Input } from '@/components/ui/input';
import debounce from 'lodash.debounce';
import Navbar from '@/components/ui/Navbar';
import _ from 'lodash';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";

export type Video = {
  id: string;
  video_id: string;
  title: string;
  description: string;
  published_at: string;
  transcript: TranscriptItem[];
};

export type TranscriptItem = {
  offset: number;
  text: string;
};

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptItem[] | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentVideoUuid, setCurrentVideoUuid] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMore, setShowMore] = useState<number | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !currentVideoUuid) return;

      setIsSearching(true);
      try {
        const response = await fetch('/api/semanticSearch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, videoId: currentVideoUuid }),
        });

        if (!response.ok) {
          throw new Error('Failed to perform semantic search');
        }

        const result = await response.json();
        if (result && playerRef.current) {
          playerRef.current.seekTo(new Date(result.timestamp).getTime() / 1000, 'seconds');
        }
      } catch (error) {
        console.error('Error performing semantic search:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [currentVideoUuid]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const debouncedGlobalSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) return;

      setIsSearching(true);
      try {
        const response = await fetch('/api/globalSemanticSearch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Failed to perform global semantic search');
        }

        const result = await response.json();
        setSearchResults(result);
      } catch (error) {
        console.error('Error performing global semantic search:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedGlobalSearch(e.target.value);
  };

  const displayTranscript = (transcript: TranscriptItem[], videoId: string, video_uuid: string) => {
    console.log("displaying transcript");
    setSelectedTranscript(transcript);
    setCurrentVideoId(videoId);
    setCurrentVideoUuid(video_uuid);
  };

  useEffect(() => {
    console.log("selectedTranscript", selectedTranscript);
  }, [selectedTranscript]);

  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <a href={`https://www.youtube.com/watch?v=${row.original.video_id}`} target="_blank" rel="noopener noreferrer">{row.original.title}</a>,
    },
    {
      accessorKey: "video_id",
      header: "Video ID",
      cell: ({ row }) => <a href={`https://www.youtube.com/watch?v=${row.original.video_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{row.original.video_id}</a>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="max-w-xs truncate">{row.original.description}</div>,
    },
    {
      accessorKey: "published_at",
      header: "Published At",
      cell: ({ row }) => new Date(row.original.published_at).toLocaleString(),
    },
    {
      id: "transcript",
      header: "Transcript",
      cell: ({ row }) => <Button onClick={() => { console.log("selected"); displayTranscript(row.original.transcript, row.original.video_id, row.original.id); }}>Search Transcript</Button>,
    },
  ];

  useEffect(() => {
    const loadVideos = async () => {
      let allVideoIds: { video_uuid: string }[] = [];
      let from = 0;
      const limit = 1000;
      let fetchMore = true;
  
      while (fetchMore) {
        const { data: videoIds, error: videoIdsError } = await supabase
          .from('video_embeddings')
          .select('video_uuid')
          .range(from, from + limit - 1);
  
        if (videoIdsError) {
          console.error('Error loading video IDs:', videoIdsError);
          return;
        }
  
        if (videoIds.length < limit) {
          fetchMore = false;
        }
  
        allVideoIds = [...allVideoIds, ...videoIds];
        from += limit;
      }
  
      console.log('Raw video IDs:', allVideoIds);
  
      const videoIdArray = Array.from(new Set(allVideoIds.map((item: { video_uuid: string }) => item.video_uuid)));
      
      console.log('Mapped and distinct video ID array:', videoIdArray);
  
      const { data: videosData, error: videosError } = await supabase
        .from('youtube')
        .select('*')
        .in('id', videoIdArray);
  
      if (videosError) {
        console.error('Error loading videos:', videosError);
        return;
      }
  
      const videosWithTranscripts = await Promise.all(videosData.map(async (video) => {
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('video_embeddings')
          .select('timestamp, text')
          .eq('video_uuid', video.id)
          .order('timestamp', { ascending: true });
  
        if (transcriptError) {
          console.error('Error loading transcript:', transcriptError);
          return { ...video, transcript: [] };
        }
  
        const transcript = transcriptData.map(item => ({
          offset: new Date(item.timestamp).getTime() / 1000,
          text: item.text,
        }));
  
        return { ...video, transcript };
      }));
  
      console.log('Fetched videos with transcripts:', videosWithTranscripts);
      setVideos(videosWithTranscripts);
    };
  
    loadVideos();
  }, []);

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTimestamp(state.playedSeconds);
  };

  useEffect(() => {
    if (selectedTranscript && transcriptRef.current) {
      const currentRow = selectedTranscript.findIndex(
        item => item.offset > currentTimestamp
      ) - 1;
      
      if (currentRow >= 0) {
        const rowElement = transcriptRef.current.querySelector(`[data-row-index="${currentRow}"]`);
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTimestamp, selectedTranscript]);

  const transcriptColumns: ColumnDef<TranscriptItem>[] = [
    {
      accessorKey: "offset",
      header: "Timestamp",
      cell: ({ row }) => (
        <div
          className={`rounded text-gray-800 font-medium p-2 w-[100px] text-center cursor-pointer ${
            row.original.offset <= currentTimestamp &&
            (row.index === selectedTranscript!.length - 1 || selectedTranscript![row.index + 1].offset > currentTimestamp)
              ? 'bg-gray-300'
              : 'bg-gray-200'
          }`}
          onClick={() => {
            if (playerRef.current) {
              playerRef.current.seekTo(row.original.offset, 'seconds');
            }
          }}
        >
          {new Date(row.original.offset * 1000).toISOString().slice(11, 19)}
        </div>
      ),
    },
    {
      accessorKey: "text",
      header: "Text",
      cell: ({ row }) => <div>{row.original.text}</div>,
    },
  ];

  const formatText = (text: string) => {
    return text
      .split('. ')
      .map(sentence => {
        const trimmedSentence = sentence.trim();
        return trimmedSentence.charAt(0).toUpperCase() + trimmedSentence.slice(1).toLowerCase();
      })
      .join('. ');
  };

  return (
    <>
    <Navbar />
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-7xl">
        <Tabs defaultValue="youtube">
          <TabsList>
            <TabsTrigger value="youtube">YouTube Directory & Transcript Semantic Search</TabsTrigger>
            <TabsTrigger value="global">Clip Search</TabsTrigger>
          </TabsList>
          <TabsContent value="youtube">
            {selectedTranscript && currentVideoId && (
              <div className="mt-10 mb-4 flex">
                <div className="w-1/2 mr-4">
                  <ReactPlayer
                    ref={playerRef}
                    url={`https://www.youtube.com/watch?v=${currentVideoId}`}
                    controls
                    playing={true}
                    width="100%"
                    height="100%"
                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                    onProgress={handleProgress}
                  />
                </div>
                <div className="w-1/2">
                  <div className="mb-4">
                    <Input
                      placeholder="Take me to..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="mb-2"
                    />
                    {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
                  </div>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="text-sm text-gray-500 sticky top-0 bg-gray-100 p-4 font-semibold flex">
                      <div className="w-1/4">Timestamp</div>
                      <div className="w-3/4">Soundbite</div>
                    </div>
                    <div ref={transcriptRef} className="max-h-96 overflow-y-auto">
                      {selectedTranscript.map((item, index) => (
                        <div
                          key={index}
                          data-row-index={index}
                          className={`flex items-start p-4 border-b border-gray-100 ${
                            item.offset <= currentTimestamp &&
                            (index === selectedTranscript.length - 1 || selectedTranscript[index + 1].offset > currentTimestamp)
                              ? 'bg-blue-50'
                              : ''
                          }`}
                        >
                          <div 
                            className="w-1/4 text-sm font-medium text-gray-600 cursor-pointer"
                            onClick={() => {
                              if (playerRef.current) {
                                playerRef.current.seekTo(item.offset, 'seconds');
                              }
                            }}
                          >
                            {new Date(item.offset * 1000).toISOString().slice(11, 19)}
                          </div>
                          <div className="w-3/4 text-gray-800 text-sm">{item.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 mb-4">
              <div className="max-h-[450px] overflow-y-auto border border-gray-200 rounded-md">
                <DataTable columns={columns} data={videos.filter(video => video.transcript.length > 0)} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="global">
            <div className="mb-4 mt-10">
              <h3 className="text-base text-gray-600 font-semibold mb-2">Global Semantic Search</h3>
              <div className="mb-4">
                <div className="flex items-center">
                  <Input
                    placeholder="Search across all videos..."
                    value={searchQuery}
                    onChange={handleGlobalSearch}
                    className="mr-2"
                  />
                  <Select>
                    <SelectTrigger className="max-w-[200px] mr-2">
                      <SelectValue placeholder="Select an outline (placeholder)" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[200px]">
                      <SelectItem value="1">Outline 1</SelectItem>
                      <SelectItem value="2">Outline 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Add to Outline</Button>
                </div>
                {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
              </div>
              <div className="rounded-md overflow-hidden">
                <Tabs defaultValue="cards">
                  <TabsList className="rounded-md">
                    <TabsTrigger value="cards">Card View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cards">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No results found.
                      </div>
                    ) : (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {searchResults.map((item, index) => (
                          <Card key={index} className="mb-4">
                            <CardHeader>
                              <CardDescription className="text-gray-800 font-semibold">{item.title}</CardDescription>
                              <CardDescription>{new Date(item.start_timestamp).toISOString().slice(11, 19)} - {new Date(item.end_timestamp).toISOString().slice(11, 19)}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ReactPlayer
                                url={`https://www.youtube.com/watch?v=${item.video_id}`}
                                controls
                                playing={true}
                                volume={0}
                                width="100%"
                                height="100%"
                                config={{
                                  youtube: {
                                    playerVars: {
                                      start: new Date(item.start_timestamp).getTime() / 1000,
                                      end: new Date(item.end_timestamp).getTime() / 1000,
                                    },
                                  },
                                }}
                              />
                              <div className="p-2">
                                <CardDescription className="mt-3 pr-2 break-words">
                                  {showMore === index ? (
                                    <>
                                      {item.description}
                                      <button
                                        onClick={() => setShowMore(null)}
                                        className="text-blue-600 hover:underline ml-2"
                                      >
                                        Show less
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {item.description.slice(0, 200)}...
                                      <button
                                        onClick={() => setShowMore(index)}
                                        className="text-blue-600 hover:underline ml-2"
                                      >
                                        Show more
                                      </button>
                                    </>
                                  )}
                                </CardDescription>
                              </div>
                              <Button className="w-full">
                                Add to Outline
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="table">
                    <DataTable
                      columns={[
                        {
                          accessorKey: "timestamp",
                          header: "Timestamp",
                          cell: ({ row }) => (
                            <div
                              className="text-sm font-medium text-gray-600 cursor-pointer"
                              onClick={() => {
                                if (playerRef.current) {
                                  playerRef.current.seekTo(new Date(row.original.start_timestamp).getTime() / 1000, 'seconds');
                                }
                              }}
                            >
                              {new Date(row.original.start_timestamp).toISOString().slice(11, 19)} - {new Date(row.original.end_timestamp).toISOString().slice(11, 19)}
                            </div>
                          ),
                        },
                        {
                          accessorKey: "video_id",
                          header: "Video ID",
                          cell: ({ row }) => <div className="text-gray-800 text-sm text-left">{row.original.video_id}</div>,
                        },
                        {
                          accessorKey: "title",
                          header: "Title",
                          cell: ({ row }) => <div className="text-gray-800 text-sm text-left">{row.original.title}</div>,
                        },
                        {
                          accessorKey: "text",
                          header: "Soundbite",
                          cell: ({ row }) => <div className=" text-gray-800 max-w-[700px] text-sm text-left">{formatText(row.original.text)}</div>,
                        },
                      ]}
                      data={searchResults}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
    </>
  );
}