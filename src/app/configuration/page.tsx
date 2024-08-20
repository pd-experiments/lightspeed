"use client"

import { Suspense, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Skeleton } from "@/components/ui/skeleton";
import PersonalizationList from '@/components/personalization/PersonalizationList';
import CampaignConfig from '@/components/configuration/CampaignConfig';

export default function PersonalizationPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Configuration</h1>
          <p className="text-base text-gray-700 mb-6">Configure your organization&apos;s information for ad calibration.</p>
          <Suspense fallback={<ConfigurationSkeleton />}>
            <CampaignConfig />
          </Suspense>
        </div>
      </main>
    </>
  );
}

function ConfigurationSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} className="h-48 w-full" />
      ))}
    </div>
  );
}