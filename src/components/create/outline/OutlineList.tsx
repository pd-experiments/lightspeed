"use client";
import { useState, useEffect } from 'react';
import { OutlineCard } from '@/components/create/outline/OutlineCard';
import { Tables } from '@/lib/types/schema';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';
import _ from 'lodash';
import { z } from 'zod';

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
      const response = await fetch('/api/create/outlines/get-all-outlines');
      const data = await response.json();
      
      const outlinesWithDetails = await Promise.all(data.outlines.map(async (outline: Outline) => {
        const elementsResponse = await fetch(`/api/create/outlines/get-elements?outline_id=${outline.id}`);
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

  const StatusSchema = z.enum(['INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK']);
  type Status = z.infer<typeof StatusSchema>;
  
  const ColorMapSchema = z.record(StatusSchema, z.string());
  
  const statusColumns: Status[] = ['INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK'];
  
  const colorMap = ColorMapSchema.parse({
    'INITIALIZED': 'bg-blue-500',
    'EDITING': 'bg-green-500',
    'GENERATING': 'bg-yellow-500',
    'SCRIPT_FINALIZED': 'bg-purple-500',
    'COMPLIANCE_CHECK': 'bg-red-500',
  });

  const groupedOutlines = statusColumns.reduce((acc, status) => {
    acc[status] = outlines.filter(outline => outline.status === status);
    return acc;
  }, {} as Record<string, OutlineWithDetails[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-6 bg-gray-50 rounded-lg">
      {loading ? (
        statusColumns.map((status, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-4">
              <div className={`w-2 h-2 rounded-full ${colorMap[status]} mr-2`}></div>
              <h2 className="text-sm font-medium text-gray-700">{_.startCase(_.toLower(status))}</h2>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton key={idx} className="h-24 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))
      ) : (
        <>
          {statusColumns.map((status) => (
            <div key={status} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-4">
                <div className={`w-2 h-2 rounded-full ${colorMap[status]} mr-2`}></div>
                <h2 className="text-sm font-medium text-gray-700">{_.startCase(_.toLower(status))}</h2>
              </div>
              <div className="space-y-3">
                {groupedOutlines[status]?.length > 0 ? (
                  groupedOutlines[status].map((outline) => (
                    <Link href={`/outline/${outline.id}`} key={outline.id} className="block transition-all hover:shadow-md">
                      <OutlineCard 
                        outline={outline} 
                        elementCount={outline.elementCount} 
                        totalDuration={outline.totalDuration} 
                        onDelete={() => setOutlines(outlines.filter(o => o.id !== outline.id))}
                        scriptGenerated={outline.script_generation_progress === 100}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-md">
                    <p className="text-sm text-gray-400">No outlines</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}