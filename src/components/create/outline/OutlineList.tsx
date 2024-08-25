"use client";
import { useState, useEffect } from 'react';
import { OutlineCard } from '@/components/create/outline/OutlineCard';
import { Tables } from '@/lib/types/schema';
import { Skeleton } from "@/components/ui/skeleton";
import _ from 'lodash';
import { z } from 'zod';

type Outline = Tables<'outline'>;

interface OutlineWithDetails extends Outline {
  elementCount: number;
  totalDuration: number;
}

export default function OutlineList({ initialOutlines, loading }: { initialOutlines: OutlineWithDetails[], loading: boolean }) {
  const [outlines, setOutlines] = useState(initialOutlines);

  useEffect(() => {
    setOutlines(initialOutlines);
  }, [initialOutlines]);

  const StatusSchema = z.enum(['INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK']);
  type Status = z.infer<typeof StatusSchema>;
  
  const statusColumns: Status[] = ['INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK'];
  
  const colorMap = {
    'INITIALIZED': 'bg-blue-500',
    'EDITING': 'bg-green-500',
    'GENERATING': 'bg-yellow-500',
    'SCRIPT_FINALIZED': 'bg-purple-500',
    'COMPLIANCE_CHECK': 'bg-red-500',
  };

  const groupedOutlines = statusColumns.reduce((acc, status) => {
    acc[status] = outlines.filter(outline => outline.status === status);
    return acc;
  }, {} as Record<string, OutlineWithDetails[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 bg-gray-50 rounded-md p-3 px-5 min-h-[500px] max-h-[500px] overflow-y-auto">
      {loading ? (
        statusColumns.map((status, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${colorMap[status]}`}></div>
              <h2 className="text-sm font-medium text-gray-700">{_.startCase(_.toLower(status))}</h2>
            </div>
            {Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ))
      ) : (
        statusColumns.map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center space-x-2 p-2 pb-4">
              <div className={`w-2 h-2 rounded-full ${colorMap[status]}`}></div>
              <h2 className="text-sm font-medium text-gray-700">{_.startCase(_.toLower(status))}</h2>
            </div>
            {groupedOutlines[status]?.length > 0 ? (
              groupedOutlines[status].map((outline) => (
                <OutlineCard 
                  key={outline.id}
                  outline={outline} 
                  elementCount={outline.elementCount} 
                  totalDuration={outline.totalDuration} 
                  onDelete={() => setOutlines(outlines.filter(o => o.id !== outline.id))}
                  scriptGenerated={outline.script_generation_progress === 100}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-md">
                <p className="text-sm text-gray-400">No outlines</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}