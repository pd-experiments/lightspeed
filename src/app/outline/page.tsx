'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Tables } from '@/lib/types/schema';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ReactPlayer from 'react-player';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronUpIcon, Trash2Icon, ChevronDownIcon } from 'lucide-react';
import { generateFcpxml } from '@/lib/helperUtils/generateFcpxml';
import { saveAs } from 'file-saver';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TimelineView from '@/components/outline/TimelineView';
import ScriptView from '@/components/outline/ScriptView';
import { calculatePosition, calculatePositionForOrdering, calculateNewTime, getTimelineDuration } from '@/lib/helperUtils/outline/utils';
import { Card, CardContent } from '@/components/ui/card';

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
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');
  const [aiOrderings, setAiOrderings] = useState<OutlineElementSuggestions[]>([]);
  const playerRef = useRef<ReactPlayer | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedView, setSelectedView] = useState('timeline');

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

  const handleClipClick = (start: string, end: string) => {
    if (playerRef.current) {
      playerRef.current.seekTo(new Date(start).getTime() / 1000, 'seconds');
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, element: OutlineElement) => {
    event.dataTransfer.setData('elementId', element.id);
    event.dataTransfer.setData('type', 'drag');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const elementId = event.dataTransfer.getData('elementId');
    const type = event.dataTransfer.getData('type');
    if (type !== 'drag') return;
  
    const newStartTime = calculateNewTime(event.clientX, timelineRef, outlineElements);
  
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
  
    const newTime = calculateNewTime(event.clientX, timelineRef, outlineElements);
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
      console.log(data);
      const orderings = data.orderings.map((order: string[], index: number) => {
        console.log("ORDER", order);
        const orderingWithDetails = order.map((id: string) => {
          const element = outlineElements.find(el => el.id === id);
          if (!element) {
            throw new Error(`Element with id ${id} not found in outlineElements`);
          }
          return element;
        });

        console.log("ORDERING WITH DETAILS", orderingWithDetails);
  
        return {
          ordering: orderingWithDetails,
          timestamps: data.timestamps[index],
          in_between: data.in_between[index]
        };
      });

      console.log(orderings);
  
      setAiOrderings(orderings);
    } catch (error) {
      console.error('Error generating AI outline ordering:', error);
      alert("Error generating AI outline ordering.");
    }
  };

  const applyOrdering = (ordering: OutlineElementWithVideoTitle[]) => {
    setOutlineElements(ordering);
    alert("AI-generated outline ordering applied successfully.");
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

  function addSecondsToTimeString(timeString: string, seconds: number): string {
    const [hours, minutes, secs] = timeString.split(':').map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + secs + seconds;
  
    const newHours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
  
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
  }

  useEffect(() => {
    console.log("OUTLINE ELEMENTS", outlineElements);
  }, [outlineElements]);

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
            <Button size="sm" onClick={handleCreateOutline}>Create Outline</Button>
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
          <div className="mb-3 flex items-center">
            <Input
              placeholder="Ex: This is a video about Donald Trump's felonious activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mr-2"
            />
          </div>
          {currentVideo && (
            <>
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="link" className="text-blue-500 hover:text-blue-700 mb-3">
                    {isOpen ? (
                      <>
                        Hide Video <ChevronUpIcon className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Video <ChevronDownIcon className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mb-6 rounded-md overflow-hidden">
                    <ReactPlayer
                      ref={playerRef}
                      url={`https://www.youtube.com/watch?v=${currentVideo.video_id}`}
                      controls
                      width="100%"
                      height="600px"
                      className="rounded-lg"
                    />
                </CollapsibleContent>
              </Collapsible>
              <div className="mb-6 flex items-center space-x-2">
                <Button size="sm" className="w-full" onClick={handleCreateOutline}>Play</Button>
                <Button size="sm" variant="outline" className="w-full" onClick={handleExportFcpxml}>Export as Final Cut Pro XML</Button>
              </div>
              <div className="pt-2 pb-6">
                <Button size="sm" className="w-full border-blue-400 text-blue-500 hover:text-blue-400 hover:border-blue-300" variant="outline" onClick={generateAIOutlineOrdering}>Generate AI Outline Suggestion(s)</Button>
              </div>
            </>
          )}
          {aiOrderings.length > 0 && (
            <div className="mb-6">
              {aiOrderings.map((orderingDetails, index) => {
                const timestamps = orderingDetails.timestamps;
                const timelineStart = timestamps.reduce((earliest, current) => current.start < earliest ? current.start : earliest, timestamps[0].start);
                const timelineEnd = timestamps.reduce((latest, current) => current.end > latest ? current.end : latest, timestamps[0].end);
              
                return (
                  <div key={index} className="mb-4 p-4 border rounded-md cursor-pointer">
                    <h4 className="text-base font-medium">Ordering {index + 1}</h4>
                    <div className="relative w-full h-auto min-h-[140px] overflow-x-scroll mt-4 p-4">
                      {orderingDetails.ordering.map((element, idx) => {
                        const timestamp = orderingDetails.timestamps.find(ts => ts.id === element.id);
                        if (!timestamp) return null;
                        const { left, width } = calculatePositionForOrdering(timestamp.start, timestamp.end, timelineStart, timelineEnd);
                        return (
                          <Card
                            key={element.video_uuid}
                            className="clip flex-shrink-0 cursor-pointer absolute"
                            style={{ left, width }}
                          >
                            <CardContent className="p-2 h-full flex flex-col justify-between">
                              <div className="text-sm justify-start w-full">
                                <span className="text-blue-500 font-semibold break-words">{element.video_title}</span>
                              </div>
                              <div className="mt-2 text-xs text-right justify-end font-medium w-full text-gray-700">
                                <span>{new Date(`1970-01-01T${timestamp.start}Z`).toISOString().slice(11, 19)} - {new Date(`1970-01-01T${timestamp.end}Z`).toISOString().slice(11, 19)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="mt-8">
                      <div className="font-semibold mb-2">LAI&apos;s suggestion:</div>
                      <div className="flex justify-between">
                        <ul className="list-disc list-inside flex-1">
                          {orderingDetails.in_between.map((transition, idx) => (
                            <li key={idx} className="break-words">
                              {transition}
                            </li>
                          ))}
                        </ul>
                        <Button size="sm" className="ml-4" onClick={() => applyOrdering(orderingDetails.ordering)}>Apply Suggestion</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <ScriptView
            key={selectedOutlineId}
            outline_id={selectedOutlineId}
            outlineElements={outlineElements}
            setOutlineElements={(newElements) => {
              setOutlineElements(newElements);
            }}
            handleDeleteElement={handleDeleteElement}
          />
          {/* <Tabs defaultValue="timeline" onValueChange={setSelectedView}>
            <div className="my-4">
              <TabsList>
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="script">Script View</TabsTrigger>
              </TabsList>
            </div> 
            <TabsContent value="timeline">
              <TimelineView
                outlineElements={outlineElements}
                totalDuration={totalDuration}
                handleClipClick={handleClipClick}
                handleDragStart={handleDragStart}
                handleResizeStart={handleResizeStart}
                handleResizeDrop={handleResizeDrop}
                handleDeleteElement={handleDeleteElement}
                calculatePosition={(start, end) => calculatePosition(start, end, outlineElements)}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                timelineRef={timelineRef}
              />
            </TabsContent>
            <TabsContent value="script">
              <ScriptView
                outline_id={selectedOutlineId}
                outlineElements={outlineElements}
                handleDeleteElement={handleDeleteElement}
              />
            </TabsContent>
          </Tabs> */}
        </div>
      </main>
    </>
  );
}