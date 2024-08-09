"use client";
import { useState, useEffect } from 'react';
import { OutlineCard } from '@/components/outline/OutlineCard';
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

  const StatusSchema = z.enum(['INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK']);
  type Status = z.infer<typeof StatusSchema>;
  
  const ColorMapSchema = z.record(StatusSchema, z.string());
  
  const statusColumns: Status[] = ['INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK'];
  
  const colorMap = ColorMapSchema.parse({
    'INITIALIZED': 'bg-blue-500',
    'EDITING': 'bg-green-500',
    'GENERATING': 'bg-yellow-500',
    'SCRIPT_FINALIZED': 'bg-purple-500',
    'COMPLIANCE_CHECK': 'bg-red-500'
  });

  const groupedOutlines = statusColumns.reduce((acc, status) => {
    acc[status] = outlines.filter(outline => outline.status === status);
    return acc;
  }, {} as Record<string, OutlineWithDetails[]>);

  return (
    <div className="flex overflow-x-auto space-x-6 p-6 bg-gray-50 rounded-lg">
      {loading ? (
        statusColumns.map((status, index) => (
          <div key={index} className="flex-shrink-0 w-72">
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-sm ${colorMap[status]} mr-2`}></div>
              <h2 className="text-lg font-semibold text-gray-700">{_.startCase(_.toLower(status))}</h2>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))
      ) : (
        <>
          {statusColumns.filter(status => groupedOutlines[status]?.length > 0).map((status) => (
            <div key={status} className="flex-shrink-0 w-72">
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-sm ${colorMap[status]} mr-2`}></div>
                <h2 className="text-md font-medium text-gray-700">{_.startCase(_.toLower(status))}</h2>
              </div>
              <div className="space-y-4">
                {groupedOutlines[status].map((outline) => (
                  <Link href={`/outline/${outline.id}`} key={outline.id} className="block transition-transform hover:scale-105">
                    <OutlineCard 
                      outline={outline} 
                      elementCount={outline.elementCount} 
                      totalDuration={outline.totalDuration} 
                      onDelete={() => setOutlines(outlines.filter(o => o.id !== outline.id))}
                      scriptGenerated={outline.script_generation_progress === 100}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {statusColumns.filter(status => !groupedOutlines[status]?.length).length > 0 && (
            <div className="flex-shrink-0 w-72">
              {statusColumns.filter(status => !groupedOutlines[status]?.length).map((status) => (
                <div key={status} className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-sm ${colorMap[status]} mr-2`}></div>
                  <h2 className="text-md font-medium text-gray-700">{_.startCase(_.toLower(status))}</h2>
                </div>
              ))}
              <Card className="p-4 bg-white shadow-sm border-dashed border-2 border-gray-200">
                <CardContent className="flex items-center justify-center h-full py-3">
                  <p className="text-sm text-gray-400">No outlines in these statuses</p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}