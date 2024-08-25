"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import TestingDashboard from '@/components/create/testing/TestingDashboard';
import { AdCreation } from '@/lib/types/customTypes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BuildTestsPage({ params }: { params: { id: string } }) {
  const [experiment, setExperiment] = useState<AdCreation | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExperiment();
  }, []);

  const fetchExperiment = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching experiment:', error);
    } else {
      setExperiment(data);
    }
  };

  if (!experiment) {
    return <div>Loading...</div>;
  }

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Time to put &quot;{experiment.title}&quot; to the test and see what resonates!
              </h1>
              <Link href="/create/testing">
                <Button variant="ghost" className="text-gray-600">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back to Experiments
                </Button>
              </Link>
            </div>
          </header>

          <div className="mt-2">
            <div className="bg-transparent rounded-lg p-3 mb-4">
              <TestingDashboard experiment={experiment}/>
            </div>
            <div className="flex justify-start items-center">
              <Button
                variant="ghost"
                onClick={() => router.push(`/create/testing/${params.id}/generate-versions`)}
                className="text-blue-600 hover:text-blue-800 whitespace-nowrap font-semibold"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Modify Generation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </Navbar>
  );
}