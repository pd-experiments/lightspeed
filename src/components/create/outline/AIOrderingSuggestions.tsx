import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OutlineElementWithVideoTitle, OutlineElementSuggestions } from '@/app/create/outline/[id]/page';

interface AIOrderingSuggestionsProps {
  aiOrderings: OutlineElementSuggestions[];
  outlineElements: OutlineElementWithVideoTitle[];
  setOutlineElements: React.Dispatch<React.SetStateAction<OutlineElementWithVideoTitle[]>>;
  calculatePositionForOrdering: (start: string, end: string, timelineStart: string, timelineEnd: string) => { left: string; width: string };
}

export function AIOrderingSuggestions({
  aiOrderings,
  outlineElements,
  setOutlineElements,
  calculatePositionForOrdering
}: AIOrderingSuggestionsProps) {
  const applyOrdering = (ordering: OutlineElementWithVideoTitle[]) => {
    setOutlineElements(ordering);
    alert("AI-generated outline ordering applied successfully.");
  };

  if (aiOrderings.length === 0) return null;

  return (
    <div className="mb-6">
      {aiOrderings.map((orderingDetails, index) => {
        const timestamps = orderingDetails.timestamps;
        const timelineStart = timestamps.reduce((earliest, current) => current.start < earliest ? current.start : earliest, timestamps[0].start);
        const timelineEnd = timestamps.reduce((latest, current) => current.end > latest ? current.end : latest, timestamps[0].end);
      
        return (
          <div key={index} className="mb-4 p-4 border rounded-md cursor-pointer">
            <h4 className="text-base font-medium">Ordering {index + 1}</h4>
            <div className="relative w-full h-auto min-h-[140px] overflow-x-scroll mt-4 p-4">
              {orderingDetails.ordering.map((element) => {
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
  );
}