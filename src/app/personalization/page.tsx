"use client"

import { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Skeleton } from "@/components/ui/skeleton";
import PersonalizationList from '@/components/personalization/PersonalizationList';

export default function PersonalizationPage() {
  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Personalization</h1>
          <p className="text-base text-gray-700 mb-6">Create personalized campaigns for your outlines ready for personalization.</p>
          <Suspense fallback={<PersonalizationSkeleton />}>
            <PersonalizationList />
          </Suspense>
        </div>
      </main>
    </Navbar>
  );
}

function PersonalizationSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} className="h-48 w-full" />
      ))}
    </div>
  );
}