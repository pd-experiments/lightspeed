'use client';
import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import ReactPlayer from 'react-player';
import { Input } from '@/components/ui/input';
// import debounce from 'lodash.debounce';

export type Video = {
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const playerRef = useRef<ReactPlayer | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const displayTranscript = (transcript: TranscriptItem[], videoId: string) => {
    console.log("displaying transcript");
    setSelectedTranscript(transcript);
    setCurrentVideoId(videoId);
  };

  useEffect(() => {
    console.log("selectedTranscript", selectedTranscript);
  }, [selectedTranscript]);

  // const handleSearch = async () => {
  //   if (!searchQuery) return;

  //   const { data: searchResults, error: searchError } = await supabase
  //     .from('video_embeddings')
  //     .select('video_uuid, timestamp, text, embedding')
  //     .textSearch('embedding', searchQuery);

  //   if (searchError) {
  //     console.error('Error searching embeddings:', searchError);
  //     return;
  //   }

  //   if (searchResults.length > 0) {
  //     const mostRelevant = searchResults[0];
  //     const videoId = mostRelevant.video_uuid;
  //     const timestamp = new Date(mostRelevant.timestamp).getTime() / 1000;

  //     setCurrentVideoId(videoId);
  //     setCurrentTimestamp(timestamp);

  //     const { data: transcriptData, error: transcriptError } = await supabase
  //       .from('video_embeddings')
  //       .select('timestamp, text')
  //       .eq('video_uuid', videoId)
  //       .order('timestamp', { ascending: true });

  //     if (transcriptError) {
  //       console.error('Error loading transcript:', transcriptError);
  //       return;
  //     }

  //     const transcript = transcriptData.map(item => ({
  //       offset: new Date(item.timestamp).getTime() / 1000,
  //       text: item.text,
  //     }));

  //     setSelectedTranscript(transcript);
  //   }
  // };

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
      cell: ({ row }) => <Button onClick={() => { console.log("selected"); displayTranscript(row.original.transcript, row.original.video_id); }}>View Transcript</Button>,
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

  // const debouncedHandleSearch = debounce(handleSearch, 300);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl font-semibold mb-4">Lightspeed</h2>
        {selectedTranscript && currentVideoId && (
          <div className="mb-4 flex">
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
                  placeholder="Search transcript (placeholder, need to implement)"
                />
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

        <div className="mb-4">
          <h3 className="text-base text-gray-600 font-semibold mb-2">Youtube Directory</h3>
          <div className="max-h-[450px] overflow-y-auto border border-gray-200 rounded-md">
            <DataTable columns={columns} data={videos.filter(video => video.transcript.length > 0)} />
          </div>
        </div>

        {/* <Button onClick={fetchAndAddVideos}>Fetch and Add Videos</Button> */}
        {/* <Button onClick={fetchAndAddEmbeddings}>Fetch and Add Embeddings</Button> */}
      </div>
    </main>
  );
}