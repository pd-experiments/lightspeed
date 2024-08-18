"use client"

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PersonalizationOptions from '@/components/personalization/PersonalizationOptions';
import { Database } from '@/lib/types/schema';
import { Skeleton } from "@/components/ui/skeleton";
import { calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';

type Outline = Database['public']['Tables']['outline']['Row'];

interface OutlineWithDetails extends Outline {
  elementCount: number;
  totalDuration: number;
}

//TODO: need to make functional, this is just UI placeholder for now.

export default function PersonalizationDetailPage({ params }: { params: { id: string } }) {
  const [outline, setOutline] = useState<OutlineWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOutlineData() {
      setLoading(true);
      try {
        const outlineResponse = await fetch(`/api/outlines/get-outline?outline_id=${params.id}`);
        const outlineData = await outlineResponse.json();

        const elementsResponse = await fetch(`/api/outlines/get-elements?outline_id=${params.id}`);
        const elementsData = await elementsResponse.json();

        setOutline({
          ...outlineData,
          elementCount: elementsData.length,
          totalDuration: calculateOutlineDuration(elementsData),
        });
      } catch (error) {
        console.error('Error fetching outline data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOutlineData();
  }, [params.id]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl mx-auto">
          <div className="w-full flex justify-between mb-4">
            <Button variant="link" className="p-0 h-auto font-normal">
              <Link href="/personalization" className="flex items-center">
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span>Back to Personalization</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-6">Personalize Advertisement</h1>
          {loading ? (
            <Skeleton className="w-full h-[400px]" />
          ) : outline ? (
            <PersonalizationOptions
              outline={outline}
              elementCount={outline.elementCount}
              totalDuration={outline.totalDuration}
            />
          ) : (
            <p>Failed to load outline data.</p>
          )}
        </div>
      </main>
    </>
  );
}