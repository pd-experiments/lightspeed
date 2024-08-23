"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database } from '@/lib/types/schema';
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalizationCard } from '@/components/personalization/PersonalizationCard';
import { calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';

type Outline = Database['public']['Tables']['outline']['Row'];
type OutlineElement = Database['public']['Tables']['outline_elements']['Row'];

interface OutlineWithDetails extends Outline {
  elementCount: number;
  totalDuration: number;
}

//TODO: need to make functional, this is just UI placeholder for now.

export default function PersonalizationList() {
  const [outlines, setOutlines] = useState<OutlineWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOutlines() {
      setLoading(true);
      try {
        const response = await fetch('/api/create/outlines/get-all-outlines');
        const data = await response.json();
        
        const personalizationOutlines = await Promise.all(data.outlines
          .filter((outline: Outline) => outline.status === 'PERSONALIZATION')
          .map(async (outline: Outline) => {
            const elementsResponse = await fetch(`/api/create/outlines/get-elements?outline_id=${outline.id}`);
            const elementsData = await elementsResponse.json();
            const elementCount = elementsData.length;
            const totalDuration = calculateOutlineDuration(elementsData);
            return { ...outline, elementCount, totalDuration };
          }));
        
        setOutlines(personalizationOutlines);
      } catch (error) {
        console.error('Error fetching outlines:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOutlines();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {outlines.length > 0 ? (
        outlines.map((outline) => (
          <Link href={`/personalization/${outline.id}`} key={outline.id} className="block">
            <PersonalizationCard
              outline={outline}
              elementCount={outline.elementCount}
              totalDuration={outline.totalDuration}
              campaignStatus={{
                text: outline.text_campaign_status === 'COMPLETED',
                email: outline.email_campaign_status === 'COMPLETED',
                phone: outline.phone_campaign_status === 'COMPLETED',
                shorts: outline.shorts_campaign_status === 'COMPLETED',
              }}
            />
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center">
          <p className="text-gray-500">No outlines ready for personalization.</p>
        </div>
      )}
    </div>
  );
}