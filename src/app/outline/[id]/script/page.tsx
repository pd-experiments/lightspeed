"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, PencilIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Layers } from 'lucide-react';
import { formatDuration, calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Spinner } from '@/components/ui/Spinner';
import { FaYoutube } from 'react-icons/fa';
import { Mic, Eye, Type, Music, Film, MonitorCheck, Download } from 'lucide-react';
import _ from 'lodash';

export default function ScriptPage({ params, searchParams }: { params: { id: string }, searchParams: { title: string } }) {
  const outlineId = params?.id as string;
  const outlineTitle = searchParams?.title || 'Untitled Outline';
  const [fullScript, setFullScript] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [elementCount, setElementCount] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [outline, setOutline] = useState<any>(null);
  const [scriptGenerationProgress, setScriptGenerationProgress] = useState<number>(0);
  const [videoInfo, setVideoInfo] = useState<Record<string, { title: string, id: string, video_id: string }>>({});
  
  const fetchVideoInfo = async (ids: string[]) => {
    const { data, error } = await supabase
      .from('youtube')
      .select('id, title, video_id')
      .in('id', ids);
  
    if (error) {
      console.error('Error fetching video info:', error);
      return;
    }
  
    const newVideoInfo: Record<string, { title: string, id: string, video_id: string }> = {};
    data.forEach(item => {
      newVideoInfo[item.id] = { title: item.title || '', id: item.id, video_id: item.video_id || '' };
    });
    setVideoInfo(newVideoInfo);
  };

  useEffect(() => {
    async function fetchOutlineData() {
      setLoading(true);
      try {
        const { data: outlineData, error: outlineError } = await supabase
          .from('outline')
          .select('*')
          .eq('id', outlineId)
          .single();
  
        if (outlineError) throw outlineError;
  
        setFullScript(outlineData.full_script);
  
        const { data: elementsData, error: elementsError } = await supabase
          .from('outline_elements')
          .select('*')
          .eq('outline_id', outlineId);
  
        console.log("elementsError", elementsError);

        if (elementsError) throw elementsError;
  
        setElementCount(elementsData.length);
        setTotalDuration(calculateOutlineDuration(elementsData));
        setOutline(outlineData);
  
        setScriptGenerationProgress(outlineData.script_generation_progress);
      } catch (error) {
        console.error('Error fetching outline data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOutlineData();
  }, [outlineId]);

  useEffect(() => {
    if (fullScript.length > 0) {
      const videoIds = fullScript.filter(item => item.id).map(item => item.id);
      if (videoIds.length > 0) {
        console.log("Fetching video info for", videoIds);
        fetchVideoInfo(videoIds);
      }
    }
  }, [fullScript]);

  const handleGenerateFullScript = async () => {
    try {
      setScriptGenerationProgress(1);
      const response = await fetch('/api/outlines/generate-full-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline_id: outlineId }),
      });
      const data = await response.json();
      setFullScript(data.fullScript);
      alert('Full script generated successfully!');
    } catch (error) {
      console.error('Error generating full script:', error);
      alert('Failed to generate full script. Please try again.');
    } finally {
      setScriptGenerationProgress(0);
    }
  };

  const renderScript = (script: any[]) => {
    return script.map((item, index) => {
      const renderHeader = (icon: React.ReactNode, text: string) => (
        <h2 className="text-sm mb-2 font-semibold text-gray-600 flex items-center">
          {icon}
          <span className="ml-2">{text}</span>
        </h2>
      );
  
      const renderContent = (content: React.ReactNode) => (
        <div key={index} className="mb-4 rounded-md border border-gray-200 p-3 bg-white shadow-sm">
          {content}
        </div>
      );
  
      switch (item.type) {
        case 'NARRATION':
          return (
            <div key={index}>
              {renderHeader(<Mic className="w-4 h-4 text-blue-500" />, 'Speaking Role')}
              {renderContent(
                <p className="text-sm text-gray-800"><strong>{item.speaker}:</strong> {item.content}</p>
              )}
            </div>
          );
        case 'VISUAL':
          return (
            <div key={index}>
              {renderHeader(<Eye className="w-4 h-4 text-green-500" />, 'Visual')}
              {renderContent(
                <p className="text-sm text-green-600">{item.content}</p>
              )}
            </div>
          );
        case 'TRANSITION':
          return (
            <div key={index}>
              {renderHeader(<MonitorCheck className="w-4 h-4 text-purple-500" />, 'Transition')}
              {renderContent(
                <p className="text-sm text-purple-600">{item.content}</p>
              )}
            </div>
          );
        case 'TEXT_OVERLAY':
          return (
            <div key={index}>
              {renderHeader(<Type className="w-4 h-4 text-orange-500" />, 'Text Overlay')}
              {renderContent(
                <p className="text-sm font-medium uppercase text-orange-600">{item.content}</p>
              )}
            </div>
          );
        case 'SOUND_EFFECT':
          return (
            <div key={index}>
              {renderHeader(<Music className="w-4 h-4 text-red-500" />, 'Sound Effect')}
              {renderContent(
                <p className="text-sm font-medium uppercase text-red-600">{item.content}</p>
              )}
            </div>
          );
        case 'EXISTING_SCRIPT':
        case 'SOUNDBITE':
          const info = videoInfo[item.id];
          const startTime = new Date(item.timestamp);
          const endTime = new Date(item.duration);
          
          const formatTime = (time: Date) => {
            if (!(time instanceof Date) || isNaN(time.getTime())) {
              return 'Invalid Time';
            }
            return time.toISOString().slice(11, 19);
          };
        
          return (
            <div key={index}>
              {renderHeader(<Film className="w-4 h-4 text-indigo-500" />, 'Soundbite')}
              {renderContent(
                <>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="inline-flex items-center py-1 px-2 space-x-2">
                      <Link href={`https://www.youtube.com/watch?v=${info?.video_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <FaYoutube className="mr-1 w-4 h-4 text-red-500" />
                        <span className="text-xs">{info?.title}</span>
                      </Link>
                    </Badge>
                    {item.timestamp && (
                      <p className="text-xs text-indigo-600">
                        <span className="font-bold">Start:</span> {formatTime(startTime)},
                        <span className="font-bold ml-1">End:</span> {formatTime(endTime)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </>
              )}
            </div>
          );
        default:
          return <p key={index} className="text-sm text-gray-700">{item.content}</p>;
      }
    });
  };

  const handleDownloadScript = () => {
    const scriptData = {
      title: outlineTitle,
      id: outlineId,
      elementCount,
      totalDuration,
      updatedAt: outline?.updated_at,
      version: outline?.version,
      script: fullScript
    };

    const jsonString = JSON.stringify(scriptData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${outlineTitle.replace(/\s+/g, '_')}_script.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <Button variant="link" className="mb-4 p-0 h-auto font-normal">
            <Link href={`/outline/${outlineId}`} className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Outline</span>
            </Link>
          </Button>
          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-bold mr-4">{_.startCase(outlineTitle)} Script</h1>
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
                  <span>Updated: {outline ? new Date(outline.updated_at).toLocaleDateString() : ''}</span>
                </Badge>
                <Badge variant="default" className="flex items-center">
                  <PencilIcon className="w-4 h-4 mr-1" />
                  <span>Version: {outline?.version ?? "1.0"}</span>
                </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGenerateFullScript} 
              className="mb-4 w-full"
              disabled={scriptGenerationProgress > 0 && scriptGenerationProgress < 100}
            >
              {/* {scriptGenerationProgress > 0 ? (
                  scriptGenerationProgress < 100 ? (
                  <div className="flex items-center justify-center">
                      <CircularProgressbar
                      value={scriptGenerationProgress}
                      text={`${scriptGenerationProgress}%`}
                      styles={{
                          root: { width: '24px', height: '24px', marginRight: '8px' },
                          path: { stroke: 'currentColor' },
                          text: { fill: 'currentColor', fontSize: '24px' },
                      }}
                      />
                      <span className="text-blue-500">Generating...</span>
                  </div>
                  ) : (
                  <span className="text-blue-500">Regenerate Full Script</span>
                  )
              ) : (
                  'Generate Full Script'
              )} */}
              {scriptGenerationProgress > 0 && scriptGenerationProgress < 100 ? (
                  <div className="flex items-center justify-center">
                  <Spinner className="mr-2 h-4 w-4" />
                  <span className="text-blue-500">Generating...</span>
                  </div>
              ) : (
                  scriptGenerationProgress === 100 ? <span className="text-blue-500">Regenerate Full Script</span> : <span className="text-blue-500">Generate Full Script</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="mb-4 w-full"
              onClick={handleDownloadScript}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Script JSON
            </Button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="my-4 p-4 bg-white border border-gray-200 rounded-lg shadow">
              <div className="space-y-4">{renderScript(fullScript)}</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}