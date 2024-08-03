'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Tables } from '@/lib/types/schema';
import ReactPlayer from 'react-player';
import { Input } from '@/components/ui/input';
import { generateFcpxml } from '@/lib/helperUtils/generateFcpxml';
import { saveAs } from 'file-saver';
import ScriptView from '@/components/outline/ScriptView';
import { calculatePosition, calculatePositionForOrdering, calculateNewTime, getTimelineDuration } from '@/lib/helperUtils/outline/utils';

import { OutlineCreator } from '@/components/outline/OutlineCreator';
import { OutlineSelector } from '@/components/outline/OutlineSelector';
import { VideoPlayer } from '@/components/ui/SimpleVideoPlayer';
import { AIOrderingSuggestions } from '@/components/outline/AIOrderingSuggestions';
import { OutlineActions } from '@/components/outline/OutlineActions';

type Outline = Tables<'outline'>;
type OutlineElement = Tables<'outline_elements'>;
export type OutlineElementWithVideoTitle = OutlineElement & { video_title: string };
export type OutlineElementSuggestions = {
  ordering: OutlineElementWithVideoTitle[];
  timestamps: { id: string; start: string; end: string }[];
  in_between: string[];
};
type YouTubeVideo = Tables<'youtube'>;

export default function Lists() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | null>(null);
  const [outlineElements, setOutlineElements] = useState<OutlineElementWithVideoTitle[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [aiOrderings, setAiOrderings] = useState<OutlineElementSuggestions[]>([]);
  const playerRef = useRef<ReactPlayer | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    async function fetchOutlines() {
      const response = await fetch('/api/outlines/get-all-outlines');
      const data = await response.json();
      setOutlines(data.outlines);
      if (data.outlines.length > 0) {
        setSelectedOutlineId(data.outlines[0].id);
      }
    }
    fetchOutlines();
  }, []);

  useEffect(() => {
    async function fetchOutlineElements() {
      if (selectedOutlineId) {
        const response = await fetch(`/api/outlines/get-elements?outline_id=${selectedOutlineId}`);
        const data = await response.json();
        const updatedElements = await Promise.all(data.map(async (element: OutlineElement) => {
          if (element.type === 'TRANSITION') {
            return { ...element, video_title: 'Transition' };
          }
          const videoResponse = await fetch(`/api/get-video-by-id?id=${element.video_uuid}`);
          const videoData = await videoResponse.json();
          return { ...element, video_title: videoData.title };
        }));
        setOutlineElements(updatedElements);
        if (updatedElements.length > 0) {
          const firstVideoElement = updatedElements.find(el => el.type !== 'TRANSITION');
          if (firstVideoElement) {
            const videoResponse = await fetch(`/api/get-video-by-id?id=${firstVideoElement.video_uuid}`);
            const videoData = await videoResponse.json();
            setCurrentVideo(videoData);
          }
        }
      }
    }
    fetchOutlineElements();
  }, [selectedOutlineId]);
  
  useEffect(() => {
    const { start, end } = getTimelineDuration(outlineElements);
    setTotalDuration((end.getTime() - start.getTime()) / 1000); 
  }, [outlineElements]);

  const handleCreateOutline = async (title: string) => {
    const newOutline = {
      title,
      created_at: new Date(),
      updated_at: new Date(),
      description: null,
    };

    try {
      const response = await fetch('/api/outlines/create-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline: newOutline }),
      });

      if (!response.ok) {
        throw new Error('Failed to create outline');
      }

      const data = await response.json();
      alert('Outline created successfully.');
      setOutlines([
        ...outlines, 
        { 
          ...newOutline, 
          id: data.id, 
          description: null, 
          created_at: newOutline.created_at.toISOString(), 
          updated_at: newOutline.updated_at.toISOString() 
        }
      ]);
    } catch (error) {
      console.error('Error creating outline:', error);
      alert('Error creating outline.');
    }
  };

  const generateAIOutlineOrdering = async () => {
    if (!selectedOutlineId) {
      alert("Please select an outline first.");
      return;
    }
  
    try {
      const response = await fetch('/api/outlines/create-ai-outline-ordering', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ element_ids: outlineElements.map(el => el.id) }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate AI outline ordering');
      }
  
      const data = await response.json();
      const orderings = data.orderings.map((order: string[], index: number) => {
        const orderingWithDetails = order.map((id: string) => {
          const element = outlineElements.find(el => el.id === id);
          if (!element) {
            throw new Error(`Element with id ${id} not found in outlineElements`);
          }
          return element;
        });
  
        return {
          ordering: orderingWithDetails,
          timestamps: data.timestamps[index],
          in_between: data.in_between[index]
        };
      });
  
      setAiOrderings(orderings);
    } catch (error) {
      console.error('Error generating AI outline ordering:', error);
      alert("Error generating AI outline ordering.");
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    try {
      const response = await fetch(`/api/outlines/delete-element`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: elementId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete element');
      }

      alert("Element deleted from outline successfully.");
  
      setOutlineElements(outlineElements.filter(element => element.id !== elementId));
    } catch (error) {
      console.error('Error deleting element:', error);
      alert('Error deleting element.');
    }
  };

  const handleExportFcpxml = () => {
    const fcpxmlContent = generateFcpxml(outlineElements);
    const blob = new Blob([fcpxmlContent], { type: 'application/xml' });
    saveAs(blob, 'outline.fcpxml');
  };

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Outlines</h1>
          <p className="text-base text-gray-700 mb-6">Create and manage outlines for your political video productions with simple AI workflows.</p>
          <OutlineCreator onCreateOutline={handleCreateOutline} />
          <div className="mb-3 flex items-center">
            <OutlineSelector
              outlines={outlines}
              selectedOutlineId={selectedOutlineId}
              onSelectOutline={setSelectedOutlineId}
            />
          </div>
          <div className="mb-3 flex items-center">
            <Input
              placeholder="Ex: This is a video about Donald Trump's felonious activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mr-2"
            />
          </div>
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
            key={selectedOutlineId}
            outline_id={selectedOutlineId}
            outlineElements={outlineElements}
            setOutlineElements={setOutlineElements}
            handleDeleteElement={handleDeleteElement}
          />
        </div>
      </main>
    </>
  );
}