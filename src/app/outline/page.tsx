'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Tables } from '@/lib/types/schema';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ReactPlayer from 'react-player';
import { Card, CardContent } from '@/components/ui/card';

type Outline = Tables<'outline'>;
type OutlineElement = Tables<'outline_elements'>;
type YouTubeVideo = Tables<'youtube'>;

const dummyOutlines: Outline[] = [
  { id: '1', title: 'Outline 1', description: 'Description 1', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: '2', title: 'Outline 2', description: 'Description 2', created_at: '2023-01-02T00:00:00Z', updated_at: '2023-01-02T00:00:00Z' },
];

const dummyOutlineElements: OutlineElement[] = [
  { id: '1', outline_id: '1', updated_at: '2023-01-01T00:00:00Z', video_uuid: '128199212992199', video_start_time: '2023-01-01T00:00:00Z', video_end_time: '2023-01-01T00:00:10Z', position_start_time: '2023-01-01T00:00:00Z', position_end_time: '2023-01-01T00:00:10Z', created_at: '2023-01-01T00:00:00Z', video_embeddings: [] },
  { id: '2', outline_id: '1', updated_at: '2023-01-01T00:00:00Z', video_uuid: '128199212992199', video_start_time: '2023-01-01T00:00:10Z', video_end_time: '2023-01-01T00:00:20Z', position_start_time: '2023-01-01T00:00:15Z', position_end_time: '2023-01-01T00:00:20Z', created_at: '2023-01-01T00:00:00Z', video_embeddings: [] },
];

export default function Lists() {
  const [outlines, setOutlines] = useState<Outline[]>(dummyOutlines);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | null>(null);
  const [outlineElements, setOutlineElements] = useState<OutlineElement[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    if (selectedOutlineId) {
      const elements = dummyOutlineElements.filter(element => element.outline_id === selectedOutlineId);
      setOutlineElements(elements);
      if (elements.length > 0) {
        setCurrentVideo({ id: '1', video_id: 'dQw4w9WgXcQ', title: 'Sample Video', description: 'Sample Description', created_at: '2023-01-01T00:00:00Z', published_at: '2023-01-01T00:00:00Z', transcript: null });
      }
    }
  }, [selectedOutlineId]);

  const handleClipClick = (start: string, end: string) => {
    if (playerRef.current) {
      playerRef.current.seekTo(new Date(start).getTime() / 1000, 'seconds');
    }
  };

  function calculatePosition(start: string, end: string) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const firstElement = dummyOutlineElements[0];
    const lastElement = dummyOutlineElements[dummyOutlineElements.length - 1];
  
    if (!firstElement.position_start_time || !lastElement.position_end_time) {
      return { left: '0%', width: '0%' };
    }
  
    const totalDuration = new Date(lastElement.position_end_time).getTime() - new Date(firstElement.position_start_time).getTime();
    const left = ((startTime - new Date(firstElement.position_start_time).getTime()) / totalDuration) * 100;
    const width = (endTime - startTime) / totalDuration * 100;
  
    return { left: `${left}%`, width: `${width}%` };
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <Select onValueChange={(value) => setSelectedOutlineId(value || '')} value={selectedOutlineId || ''}>
            <SelectTrigger className="mb-6 p-2 border">
              <SelectValue placeholder="Select an outline" />
            </SelectTrigger>
            <SelectContent>
              {outlines.map((outline) => (
                <SelectItem key={outline.id} value={outline.id}>
                  {outline.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentVideo && (
            <div className="mb-6 rounded-md overflow-hidden">
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentVideo.video_id}`}
                controls
                width="100%"
                height="600px"
                className="rounded-lg"
              />
            </div>
          )}
          <div className="video-editor relative w-full h-auto mt-4">
            {outlineElements.map((element) => {
              if (!element.position_start_time || !element.position_end_time) return null;
              const { left, width } = calculatePosition(element.position_start_time, element.position_end_time);
              return (
                <Card
                  key={element.video_uuid}
                  className="clip flex-shrink-0 cursor-pointer absolute"
                  style={{ left, width, minHeight: '150px' }}
                  onClick={() => handleClipClick(element.video_start_time, element.video_end_time)}
                >
                  <CardContent className="p-2 h-full flex flex-col justify-between"> 
                    <div className="text-sm justify-start w-full">
                      <span className="text-blue-500 font-semibold break-words">{element.video_uuid}</span>
                    </div>
                    <div className="relative my-2 rounded-md h-full">
                      <ReactPlayer
                        url={`https://www.youtube.com/watch?v=${element.video_uuid}`}
                        controls
                        width="100%"
                        height="100%"
                        className="rounded-lg"
                        config={{
                          youtube: {
                            playerVars: {
                              start: new Date(element.video_start_time).getTime() / 1000,
                              end: new Date(element.video_end_time).getTime() / 1000,
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="text-xs text-right justify-end font-medium w-full text-gray-700">
                      <span>{new Date(element.video_start_time).toISOString().slice(11, 19)} - {new Date(element.video_end_time).toISOString().slice(11, 19)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}