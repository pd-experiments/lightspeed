"use client";

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Tables } from '@/lib/types/schema';
import ReactPlayer from 'react-player';
import { generateFcpxml } from '@/lib/helperUtils/generateFcpxml';
import { saveAs } from 'file-saver';
import ScriptView from '@/components/outline/ScriptView';
import { calculatePosition, calculatePositionForOrdering, calculateNewTime, getTimelineDuration } from '@/lib/helperUtils/outline/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from '@/components/ui/SimpleVideoPlayer';
import { AIOrderingSuggestions } from '@/components/outline/AIOrderingSuggestions';
import { OutlineActions } from '@/components/outline/OutlineActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type Outline = Tables<'outline'>;
type OutlineElement = Tables<'outline_elements'>;
export type OutlineElementWithVideoTitle = OutlineElement & { video_title: string };
export type OutlineElementSuggestions = {
  ordering: OutlineElementWithVideoTitle[];
  timestamps: { id: string; start: string; end: string }[];
  in_between: string[];
};
type YouTubeVideo = Tables<'youtube'>;

export default function OutlinePage({ params }: { params: { id: string } }) {
  const outlineId = params?.id as string;

  const [outline, setOutline] = useState<Outline | null>(null);
  const [outlineElements, setOutlineElements] = useState<OutlineElementWithVideoTitle[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiOrderings, setAiOrderings] = useState<OutlineElementSuggestions[]>([]);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    async function fetchOutlineData() {
      setLoading(true);
      try {
        // Fetch outline details
        const outlineResponse = await fetch(`/api/outlines/get-outline?outline_id=${outlineId}`);
        const outlineData = await outlineResponse.json();
        setOutline(outlineData);

        // Fetch outline elements
        const elementsResponse = await fetch(`/api/outlines/get-elements?outline_id=${outlineId}`);
        const elementsData = await elementsResponse.json();
        const updatedElements = await Promise.all(elementsData.map(async (element: OutlineElement) => {
          if (element.type === 'TRANSITION') {
            return { ...element, video_title: 'Transition' };
          }
          const videoResponse = await fetch(`/api/get-video-by-id?id=${element.video_uuid}`);
          const videoData = await videoResponse.json();
          return { ...element, video_title: videoData.title };
        }));
        setOutlineElements(updatedElements);

        // Set current video
        if (updatedElements.length > 0) {
          const firstVideoElement = updatedElements.find(el => el.type !== 'TRANSITION');
          if (firstVideoElement) {
            const videoResponse = await fetch(`/api/get-video-by-id?id=${firstVideoElement.video_uuid}`);
            const videoData = await videoResponse.json();
            setCurrentVideo(videoData);
          }
        }
      } catch (error) {
        console.error('Error fetching outline data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOutlineData();
  }, [outlineId]);

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  const handleExportFcpxml = async () => {
    const fcpxml = generateFcpxml(outlineElements);
    const blob = new Blob([fcpxml], { type: 'text/xml;charset=utf-8' });
    saveAs(blob, 'outline.fcpxml');
  };

  const generateAIOutlineOrdering = async () => {
    try {
      const response = await fetch('/api/outlines/create-ai-outline-ordering', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outlineElements }),
      });
      const data = await response.json();
      setAiOrderings(data.suggestions);
    } catch (error) {
      console.error('Error generating AI outline ordering:', error);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    try {
      await fetch(`/api/outlines/delete-element?id=${elementId}`, { method: 'DELETE' });
      setOutlineElements(outlineElements.filter(el => el.id !== elementId));
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-7xl">
          <Button variant="link" className="mb-4 p-0 h-auto font-normal">
            <Link href="/outline" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Outlines</span>
            </Link>
          </Button>
        </div>
        <div className="w-full max-w-7xl">
          {loading ? (
            <Skeleton className="w-full h-16 mb-6" />
          ) : (
            <h1 className="text-3xl font-bold mb-6">{outline?.title}</h1>
          )}
          {loading ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <>
              {currentVideo && currentVideo.video_id && (
                <>
                  <VideoPlayer videoId={currentVideo.video_id} playerRef={playerRef} />
                  <OutlineActions
                    onPlay={handlePlay}
                    onExport={handleExportFcpxml}
                    onGenerateAIOrdering={generateAIOutlineOrdering}
                  />
                </>
              )}
              <AIOrderingSuggestions
                aiOrderings={aiOrderings}
                outlineElements={outlineElements}
                setOutlineElements={setOutlineElements}
                calculatePositionForOrdering={calculatePositionForOrdering}
              />
              <ScriptView
                key={outlineId}
                outline_id={outlineId}
                outlineElements={outlineElements}
                setOutlineElements={setOutlineElements}
                handleDeleteElement={handleDeleteElement}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}