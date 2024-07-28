'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Tables } from '@/lib/types/schema';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ReactPlayer from 'react-player';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Outline = Tables<'outline'>;
type OutlineElement = Tables<'outline_elements'>;
type YouTubeVideo = Tables<'youtube'>;

export default function Lists() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | null>(null);
  const [outlineElements, setOutlineElements] = useState<OutlineElement[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');
  const playerRef = useRef<ReactPlayer | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchOutlines() {
      const response = await fetch('/api/outlines/get-all-outlines');
      const data = await response.json();
      setOutlines(data.outlines);
    }
    fetchOutlines();
  }, []);

  useEffect(() => {
    async function fetchOutlineElements() {
      if (selectedOutlineId) {
        const response = await fetch(`/api/outlines/get-elements?outline_id=${selectedOutlineId}`);
        const data = await response.json();
        setOutlineElements(data);
        if (data.length > 0) {
          const videoUuid = data[0].video_uuid;
          const videoResponse = await fetch(`/api/get-video-by-id?id=${videoUuid}`);
          const videoData = await videoResponse.json();
          setCurrentVideo(videoData);
          console.log(currentVideo);
        }
      }
    }
    fetchOutlineElements();
  }, [selectedOutlineId]);

  useEffect(() => {
    const { start, end } = getTimelineDuration();
    setTotalDuration((end.getTime() - start.getTime()) / 1000); 
  }, [outlineElements]);

  const handleClipClick = (start: string, end: string) => {
    if (playerRef.current) {
      playerRef.current.seekTo(new Date(start).getTime() / 1000, 'seconds');
    }
  };

  function calculatePosition(start: string, end: string) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const firstElement = outlineElements[0];
    const lastElement = outlineElements[outlineElements.length - 1];
  
    if (!firstElement.position_start_time || !lastElement.position_end_time) {
      return { left: '0%', width: '0%' };
    }
  
    const totalDuration = new Date(lastElement.position_end_time).getTime() - new Date(firstElement.position_start_time).getTime();
    const left = ((startTime - new Date(firstElement.position_start_time).getTime()) / totalDuration) * 100;
    const width = ((endTime - startTime) / totalDuration) * 100;
  
    return { left: `${left}%`, width: `${width}%` };
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, element: OutlineElement) => {
    event.dataTransfer.setData('elementId', element.id);
    event.dataTransfer.setData('type', 'drag');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const elementId = event.dataTransfer.getData('elementId');
    const type = event.dataTransfer.getData('type');
    if (type !== 'drag') return;
  
    const newStartTime = calculateNewTime(event.clientX);
  
    const updatedElements = outlineElements.map(element => {
      if (element.id === elementId && element.position_end_time && element.position_start_time) {
        const originalDuration = new Date(element.position_end_time).getTime() - new Date(element.position_start_time).getTime();
        const newEndTime = new Date(new Date(newStartTime).getTime() + originalDuration).toISOString();
        return { ...element, position_start_time: newStartTime, position_end_time: newEndTime };
      }
      return element;
    });
  
    const currentElement = updatedElements.find(element => element.id === elementId);
    if (currentElement && currentElement.position_start_time && currentElement.position_end_time) {
      const currentStartTime = new Date(currentElement.position_start_time).getTime();
      const currentEndTime = new Date(currentElement.position_end_time).getTime();
  
      for (let i = 0; i < updatedElements.length; i++) {
        if (updatedElements[i].id !== elementId) {
          const { position_start_time, position_end_time } = updatedElements[i];
          if (position_start_time && position_end_time) {
            const elementStartTime = new Date(position_start_time).getTime();
            const elementEndTime = new Date(position_end_time).getTime();
    
            if ((currentStartTime < elementEndTime && currentEndTime > elementStartTime)) {
              const originalDuration = elementEndTime - elementStartTime;
              const newStartTime = new Date(currentEndTime + 1000).toISOString();
              const newEndTime = new Date(new Date(newStartTime).getTime() + originalDuration).toISOString();
              updatedElements[i].position_start_time = newStartTime;
              updatedElements[i].position_end_time = newEndTime;
            }
          }
        }
      }
    }
  
    setOutlineElements(updatedElements);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleResizeStart = (event: React.DragEvent<HTMLDivElement>, element: OutlineElement, direction: 'left' | 'right') => {
    event.dataTransfer.setData('elementId', element.id);
    event.dataTransfer.setData('direction', direction);
    event.dataTransfer.setData('type', 'resize');
  };

  const handleResizeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const elementId = event.dataTransfer.getData('elementId');
    const direction = event.dataTransfer.getData('direction');
    const type = event.dataTransfer.getData('type');
    if (type !== 'resize') return;
  
    const newTime = calculateNewTime(event.clientX);
    const updatedElements = outlineElements.map(element => {
      if (element.id === elementId) {
        if (direction === 'left') {
          return { ...element, position_start_time: newTime };
        } else if (direction === 'right') {
          return { ...element, position_end_time: newTime };
        }
      }
      return element;
    });
  
    const currentElement = updatedElements.find(element => element.id === elementId);
    if (currentElement && currentElement.position_start_time && currentElement.position_end_time) {
      const currentStartTime = new Date(currentElement.position_start_time).getTime();
      const currentEndTime = new Date(currentElement.position_end_time).getTime();
  
      for (let i = 0; i < updatedElements.length; i++) {
        if (updatedElements[i].id !== elementId) {
          const { position_start_time, position_end_time } = updatedElements[i];
          if (position_start_time && position_end_time) {
            const elementStartTime = new Date(position_start_time).getTime();
            const elementEndTime = new Date(position_end_time).getTime();
  
            if ((currentStartTime < elementEndTime && currentEndTime > elementStartTime)) {
              const originalDuration = elementEndTime - elementStartTime;
              const newStartTime = new Date(currentEndTime + 1000).toISOString();
              const newEndTime = new Date(new Date(newStartTime).getTime() + originalDuration).toISOString();
              updatedElements[i].position_start_time = newStartTime;
              updatedElements[i].position_end_time = newEndTime;
            }
          }
        }
      }
    }
  
    setOutlineElements(updatedElements);
  };

  const calculateNewTime = (clientX: number) => {
    if (!timelineRef.current) return new Date().toISOString();
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const firstElementStartTime = outlineElements[0]?.position_start_time;
    const lastElementEndTime = outlineElements[outlineElements.length - 1]?.position_end_time;

    if (!firstElementStartTime || !lastElementEndTime) return new Date().toISOString();

    const totalDuration = new Date(lastElementEndTime).getTime() - new Date(firstElementStartTime).getTime();
    const newTime = new Date(new Date(firstElementStartTime).getTime() + ((clientX - timelineRect.left) / timelineRect.width) * totalDuration);
    return newTime.toISOString();
  };

  const getTimelineDuration = () => {
    if (outlineElements.length === 0) return { start: new Date(), end: new Date() };
    const validElements = outlineElements.filter(element => element.position_start_time && element.position_end_time);
    const startTimes = validElements.map(element => new Date(element.position_start_time!).getTime());
    const endTimes = validElements.map(element => new Date(element.position_end_time!).getTime());
    const earliestStart = new Date(Math.min(...startTimes));
    const latestEnd = new Date(Math.max(...endTimes));
    return { start: earliestStart, end: latestEnd };
  };

  const handleCreateOutline = async () => {
    if (!newOutlineTitle.trim()) {
      alert('Please enter a title for the new outline.');
      return;
    }

    const newOutline = {
      title: newOutlineTitle,
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
      setNewOutlineTitle('');
    } catch (error) {
      console.error('Error creating outline:', error);
      alert('Error creating outline.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <div className="mb-6 flex items-center">
            <Input
              placeholder="Enter new outline title"
              value={newOutlineTitle}
              onChange={(e) => setNewOutlineTitle(e.target.value)}
              className="mr-2"
            />
            <Button onClick={handleCreateOutline}>Create Outline</Button>
          </div>
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
          <div ref={timelineRef} className="overflow-y-scroll p-2 border border-gray-200 rounded-md video-editor relative w-full h-auto min-h-[250px] mt-4" onDrop={handleDrop} onDragOver={handleDragOver}>
            <div className="absolute top-0 left-0 w-full h-full">
              {Array.from({ length: Math.round(totalDuration) }).map((_, index) => (
                <div key={index} className="absolute border-l border-gray-300" style={{ left: `${(index / totalDuration) * 100}%`, height: index % 5 === 0 ? '100%' : '50%' }}>
                  {index % 5 === 0 ? <span className="text-xs">{index}s</span> : <span className="text-[0.5rem]">&nbsp;</span>}
                </div>
              ))}
            </div>
            {outlineElements.map((element) => {
              if (!element.position_start_time || !element.position_end_time) return null;
              const { left, width } = calculatePosition(element.position_start_time, element.position_end_time);
              return (
                <Card
                  key={element.video_uuid}
                  className="clip flex-shrink-0 cursor-pointer absolute"
                  style={{ left, width, minHeight: '150px', top: '20px' }}
                  onClick={() => handleClipClick(element.video_start_time, element.video_end_time)}
                  draggable
                  onDragStart={(event) => handleDragStart(event, element)}
                >
                  <div
                    className="resize-handle-left absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
                    draggable
                    onDragStart={(event) => handleResizeStart(event, element, 'left')}
                    onDrop={handleResizeDrop}
                  />
                  <CardContent className="p-2 h-full flex flex-col justify-between"> 
                    <div className="text-sm justify-start w-full">
                      <span className="text-blue-500 font-semibold break-words">{element.video_uuid}</span>
                    </div>
                    <div className="relative my-2 rounded-md h-full">
                      <ReactPlayer
                        url={`https://www.youtube.com/watch?v=${element.video_id}`}
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
                      <span>{new Date(element.position_start_time).toISOString().slice(11, 19)} - {new Date(element.position_end_time).toISOString().slice(11, 19)}</span>
                    </div>
                  </CardContent>
                  <div
                    className="resize-handle-right absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
                    draggable
                    onDragStart={(event) => handleResizeStart(event, element, 'right')}
                    onDrop={handleResizeDrop}
                  />
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}