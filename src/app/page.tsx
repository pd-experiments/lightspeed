'use client';
import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import ReactPlayer from 'react-player';

export type Video = {
  video_id: string;
  title: string;
  description: string;
  published_at: string;
  transcript: any;
};

export type TranscriptItem = {
  offset: number;
  text: string;
};

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptItem[] | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);

  const displayTranscript = (transcript: TranscriptItem[], videoId: string) => {
    console.log("displaying transcript");
    setSelectedTranscript(transcript);
    setCurrentVideoId(videoId);
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
      cell: ({ row }) => <Button onClick={() => { console.log("selected"); displayTranscript(row.original.transcript, row.original.video_id); }}>View Transcript</Button>,
    },
  ];

  useEffect(() => {
    // Load videos from Supabase
    const loadVideos = async () => {
      const { data, error } = await supabase
        .from('youtube')
        .select('*');

      if (error) {
        console.error('Error loading videos:', error);
      } else {
        setVideos(data);
      }
    };

    loadVideos();
  }, []);

  const fetchAndAddVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(prevVideos => [...prevVideos, ...data]);
    } catch (error) {
      console.error('Error fetching and adding videos:', error);
    }
  };

  const transcriptColumns: ColumnDef<TranscriptItem>[] = [
    {
      accessorKey: "offset",
      header: "Timestamp",
      cell: ({ row }) => (
        <div
          className="bg-gray-200 rounded text-gray-800 font-medium p-2 w-[100px] text-center cursor-pointer"
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl font-semibold mb-4">Lightspeed</h2>
        {selectedTranscript && currentVideoId && (
          <div className="mb-4 flex">
            <div className="w-1/2 ml-4">
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentVideoId}`}
                controls
                playing={true}
                width="100%"
                height="100%"
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              />
            </div>
            <div className="w-1/2">
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                <DataTable columns={transcriptColumns} data={selectedTranscript} />
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-base text-gray-600 font-semibold mb-2">Youtube Directory</h3>
          <div className="max-h-[450px] overflow-y-auto border border-gray-200 rounded-md">
            <DataTable columns={columns} data={videos.filter(video => video.transcript !== null)} />
          </div>
        </div>

        <Button onClick={fetchAndAddVideos}>Fetch and Add Videos</Button>
      </div>
    </main>
  );
}