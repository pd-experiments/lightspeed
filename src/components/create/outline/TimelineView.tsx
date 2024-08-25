import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import ReactPlayer from 'react-player';
import { OutlineElementWithVideoTitle } from '@/app/create/ideation/television/[id]/page';

interface TimelineViewProps {
  outlineElements: OutlineElementWithVideoTitle[];
  totalDuration: number;
  handleClipClick: (start: string, end: string) => void;
  handleDragStart: (event: React.DragEvent<HTMLDivElement>, element: OutlineElementWithVideoTitle) => void;
  handleResizeStart: (event: React.DragEvent<HTMLDivElement>, element: OutlineElementWithVideoTitle, direction: 'left' | 'right') => void;
  handleResizeDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDeleteElement: (elementId: string) => void;
  calculatePosition: (start: string, end: string) => { left: string; width: string };
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  timelineRef: React.RefObject<HTMLDivElement>;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  outlineElements,
  totalDuration,
  handleClipClick,
  handleDragStart,
  handleResizeStart,
  handleResizeDrop,
  handleDeleteElement,
  calculatePosition,
  handleDrop,
  handleDragOver,
  timelineRef,
}) => {
  return (
    <div ref={timelineRef} className="overflow-y-scroll p-2 border border-gray-200 rounded-md video-editor relative w-full h-auto min-h-[280px] mt-4" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="absolute top-0 left-0 w-full h-full">
        {Array.from({ length: Math.round(totalDuration) }).map((_, index) => {
          const interval = totalDuration > 100 ? 10 : 5;
          return (
            <div key={index} className="absolute border-l border-gray-300" style={{ left: `${(index / totalDuration) * 100}%`, height: index % interval === 0 ? '100%' : '50%' }}>
              {index % interval === 0 ? <span className="text-xs">{index}s</span> : <span className="text-[0.5rem]">&nbsp;</span>}
            </div>
          );
        })}
      </div>
      {outlineElements.map((element) => {
        if (!element.position_start_time || !element.position_end_time) return null;
        const { left, width } = calculatePosition(element.position_start_time, element.position_end_time);
        return (
          <Card
            key={element.id}
            className="clip flex-shrink-0 cursor-pointer absolute"
            style={{ left, width, minHeight: '150px', top: '20px' }}
            onClick={() => handleClipClick(element.video_start_time ?? '', element.video_end_time ?? '')}
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
              <div className="flex text-sm justify-between w-full">
                <span className="text-blue-500 font-semibold break-words flex-grow">{element.video_title}</span>
                <Button size="sm" variant="outline" className="hover:bg-red-50" onClick={() => handleDeleteElement(element.id)}>
                  <Trash2Icon className="w-4 h-4 text-red-500"/>
                </Button>
              </div>
              {element.type !== 'TRANSITION' && (
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
                          start: new Date(element.video_start_time ?? '').getTime() / 1000,
                          end: new Date(element.video_end_time ?? '').getTime() / 1000,
                        },
                      },
                    }}
                  />
                </div>
              )}
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
  );
};

export default TimelineView;