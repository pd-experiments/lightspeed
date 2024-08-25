"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdVersionGenerator from '@/components/create/testing/AdVersionGenerator';
import TestingDashboard from '@/components/create/testing/TestingDashboard';
import { AdCreation } from '@/lib/types/customTypes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExperimentPage({ params }: { params: { id: string } }) {
  const [experiment, setExperiment] = useState<AdCreation | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'test'>('generate');
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
      setActiveTab(data.flow === "Generation" ? 'generate' : 'test');
    }
  };

  const handleMoveToTesting = async () => {
    if (experiment) {
      const updatedExperiment: AdCreation = {
        ...experiment,
        flow: 'Testing' as const
      };
      await supabase
        .from('ad_creations')
        .update({ flow: 'Testing' })
        .eq('id', experiment.id);
      setExperiment(updatedExperiment);
      setActiveTab('test');
    }
  };

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-[1500px] mx-auto p-4">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                {activeTab === 'generate' 
                  ? `Alright, let's cook up some ad magic for "${experiment?.title}"!`
                  : `Time to put "${experiment?.title}" to the test and see what resonates!`}
              </h1>
              <Link href="/create/generate">
                <Button variant="ghost" className="text-gray-600">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back to Experiments
                </Button>
              </Link>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'generate' | 'test')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Versions</TabsTrigger>
              <TabsTrigger value="test">Build Tests</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <div className="bg-transparent rounded-lg p-3 mb-4">
                {experiment && <AdVersionGenerator experiment={experiment} />}
              </div>
              <div className="flex justify-end items-center">
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-800 whitespace-nowrap font-semibold"
                  onClick={handleMoveToTesting}
                >
                  Confirm & Proceed To Testing <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="test">
              <div className="bg-transparent rounded-lg p-3 mb-4">
                {experiment && <TestingDashboard experiment={experiment}/>}
              </div>
              <div className="flex justify-start items-center">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('generate')}
                  className="text-blue-600 hover:text-blue-800 whitespace-nowrap font-semibold"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Modify Generation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}