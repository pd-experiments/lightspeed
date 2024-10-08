"use client";

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Tables } from '@/lib/types/schema';
import ReactPlayer from 'react-player';
import { generateFcpxml } from '@/lib/helperUtils/generateFcpxml';
import { saveAs } from 'file-saver';
import ScriptView from '@/components/create/outline/ScriptView';
import { calculatePosition, calculatePositionForOrdering, calculateNewTime, calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from '@/components/ui/SimpleVideoPlayer';
import { AIOrderingSuggestions } from '@/components/create/outline/AIOrderingSuggestions';
import { OutlineActions } from '@/components/create/outline/OutlineActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Layers, ChevronLeft, FileText } from 'lucide-react';
import { formatDuration } from '@/lib/helperUtils/outline/utils';
import _ from 'lodash';
import { supabase } from '@/lib/supabaseClient';

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
  const [scriptGenerationProgress, setScriptGenerationProgress] = useState<number>(0);
  const [elementCount, setElementCount] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const playerRef = useRef<ReactPlayer>(null);
  const [complianceDocTitle, setComplianceDocTitle] = useState<string>('');

  useEffect(() => {
    async function fetchOutlineData() {
      setLoading(true);
      try {
        const outlineResponse = await fetch(`/api/create/outlines/get-outline?outline_id=${outlineId}`);
        const outlineData = await outlineResponse.json();
        setOutline(outlineData);

        if (outlineData.compliance_doc) {
          const response = await supabase.from('compliance_docs').select('title').eq('id', outlineData.compliance_doc).single();
          setComplianceDocTitle(response.data?.title || 'Unknown');
        }

        const elementsResponse = await fetch(`/api/create/outlines/get-elements?outline_id=${outlineId}`);
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

        if (updatedElements.length > 0) {
          const firstVideoElement = updatedElements.find(el => el.type !== 'TRANSITION');
          if (firstVideoElement) {
            const videoResponse = await fetch(`/api/get-video-by-id?id=${firstVideoElement.video_uuid}`);
            const videoData = await videoResponse.json();
            setCurrentVideo(videoData);
          }
        }

        const progressResponse = await fetch(`/api/create/outlines/get-script-progress?outline_id=${outlineId}`);
        const progressData = await progressResponse.json();
        setScriptGenerationProgress(progressData.progress);

        setElementCount(updatedElements.length);
        setTotalDuration(calculateOutlineDuration(updatedElements));
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
      const response = await fetch('/api/create/outlines/create-ai-outline-ordering', {
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
      await fetch(`/api/create/outlines/delete-element?id=${elementId}`, { method: 'DELETE' });
      setOutlineElements(outlineElements.filter(el => el.id !== elementId));
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  const handleGenerateFullScript = async (outlineId: string) => {
    try {
      setScriptGenerationProgress(1);
      const response = await fetch('/api/create/outlines/generate-full-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline_id: outlineId }),
      });
      const data = await response.json();
      console.log('Full script:', data.fullScript);
      alert('Full script generated successfully! Check the console for details.');
    } catch (error) {
      console.error('Error generating full script:', error);
      alert('Failed to generate full script. Please try again.');
    } finally {
      setScriptGenerationProgress(0);
    }
  };

  return (
    <Navbar>
      <main className="min-h-screen flex flex-col items-center justify-between">
      <div className="w-full max-w-[1500px] mx-auto">
        <div className="w-full flex justify-between mb-4">
          <Button variant="link" className="p-0 h-auto font-normal">
            <Link href="/create/ideation" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Ideation Dashboard</span>
            </Link>
          </Button>
          <Button disabled={outline?.status !==  "SCRIPT_FINALIZED" && outline?.status !==  "COMPLIANCE_CHECK" && outline?.status !==  "PERSONALIZATION"} variant="link" className="p-0 h-auto font-normal">
            <Link href={`/create/ideation/television/${outlineId}/script?title=${encodeURIComponent(outline?.title || '')}`} className="flex items-center">
              <span>View Script</span>
              <ChevronLeft className="ml-1 h-4 w-4 transform rotate-180" />
            </Link>
          </Button>
        </div>
        <div className="w-full mt-8">
          {loading ? (
            <Skeleton isLoading={loading} className="w-full h-16 mb-6" />
          ) : (
            <div className="flex items-center mb-6">
              <h1 className="text-3xl font-bold mr-4">{_.startCase(outline?.title || '')}</h1>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="flex items-center">
                  <Layers className="w-4 h-4 mr-1" />
                  <span>{elementCount} Elements</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDuration(totalDuration)}</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Updated: {new Date(outline?.updated_at ?? '').toLocaleDateString()}</span>
                </Badge>
                <Badge variant="default" className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{complianceDocTitle}</span>
                </Badge>
              </div>
            </div>
          )}
          {loading ? (
            <Skeleton isLoading={loading} className="w-full h-64" />
          ) : (
            <>
              {currentVideo && currentVideo.video_id && (
                <>
                  <VideoPlayer videoId={currentVideo.video_id} playerRef={playerRef} />
                  <OutlineActions
                    onPlay={handlePlay}
                    onExport={handleExportFcpxml}
                    onGenerateAIOrdering={generateAIOutlineOrdering}
                    onGenerateFullScript={() => handleGenerateFullScript(outlineId)}
                    scriptGenerationProgress={scriptGenerationProgress}
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
        </div>
      </main>
    </Navbar>
  );
}