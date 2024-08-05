'use client';

import { useState, useEffect } from 'react';
import { OutlineCard } from '@/components/outline/OutlineCard';
import { Tables } from '@/lib/types/schema';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";

type Outline = Tables<'outline'>;
type OutlineElement = Tables<'outline_elements'>;

interface OutlineWithDetails extends Outline {
  elementCount: number;
  totalDuration: number;
}

export default function OutlineList() {
  const [outlines, setOutlines] = useState<OutlineWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOutlines() {
      setLoading(true);
      const response = await fetch('/api/outlines/get-all-outlines');
      const data = await response.json();
      
      const outlinesWithDetails = await Promise.all(data.outlines.map(async (outline: Outline) => {
        const elementsResponse = await fetch(`/api/outlines/get-elements?outline_id=${outline.id}`);
        const elementsData = await elementsResponse.json();
        const elementCount = elementsData.length;
        const totalDuration = calculateOutlineDuration(elementsData);
        return { ...outline, elementCount, totalDuration };
      }));

      setOutlines(outlinesWithDetails);
      setLoading(false);
    }
    fetchOutlines();
  }, []);

  function calculateOutlineDuration(outlineElements: OutlineElement[]): number {
    if (outlineElements.length === 0) return 0;
    const startTime = outlineElements[0].position_start_time ? new Date(outlineElements[0].position_start_time ?? 0).getTime() : 0;
    const endTime = outlineElements[outlineElements.length - 1].position_end_time ? new Date(outlineElements[outlineElements.length - 1].position_end_time ?? 0).getTime() : 0;
    return Math.round((endTime - startTime) / 1000);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {loading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))
      ) : outlines.length === 0 ? (
        <div className="col-span-full">
          <Card className="p-4 h-full">
            <CardContent className="flex items-center justify-center h-full py-3">
              <p className="text-base text-gray-500">You haven&apos;t created any outlines yet. Start by creating your first outline!</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        outlines.map((outline) => (
          <Link href={`/outline/${outline.id}`} key={outline.id}>
            <OutlineCard 
              outline={outline} 
              elementCount={outline.elementCount} 
              totalDuration={outline.totalDuration} 
              onDelete={() => setOutlines(outlines.filter(o => o.id !== outline.id))}
            />
          </Link>
        ))
      )}
    </div>
  );
}