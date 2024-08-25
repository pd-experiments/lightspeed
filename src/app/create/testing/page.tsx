"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Badge } from '@/components/ui/badge';
import { AdCreation, AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { useRouter } from 'next/navigation';
import { Beaker } from 'lucide-react';
import AdTestList from '@/components/create/testing/AdTestList';

export default function TestingPage() {
  const [adTests, setAdTests] = useState<AdDeploymentWithCreation[]>([]);
  const router = useRouter();
  const [isLoadingAdTests, setIsLoadingAdTests] = useState(false);

  useEffect(() => {
    fetchAdTests();
  }, []);

  const fetchAdTests = async () => {
    setIsLoadingAdTests(true);
    try {
      const { data, error } = await supabase
        .from('ad_deployments')
        .select(`
          *,
          creation:ad_creations(*)
        `)
        .eq('type', 'Test')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ad tests:', error);
      } else {
        setAdTests(data || []);
      }
    } catch (error) {
      console.error('Error fetching ad tests:', error);
      setAdTests([]);
    } finally {
      setIsLoadingAdTests(false);
    }
  };

  const selectExperiment = (experiment: AdCreation) => {
    console.log(experiment);
    router.push(`/create/testing/${experiment.id}`);
  };

  const selectTest = (testId: string) => {
    router.push(`/create/testing/${testId}`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Configured': 'bg-blue-100 text-blue-800',
      'Generated': 'bg-yellow-100 text-yellow-800',
      'Test': 'bg-purple-100 text-purple-800',
      'Deployed': 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-[1500px] mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Let&apos;s review our ad tests!
              </h1>
            </div>
          </header>

          <div className="mt-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Beaker className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Tests</h2>
              </div>
              <Badge variant="outline" className="text-sm font-medium bg-orange-500 bg-opacity-80 text-white hover:bg-orange-600 hover:bg-opacity-100">
                {adTests.length} Tests
              </Badge>
            </div>
            <div className="h-px bg-gray-200 mt-2"></div>
          </div>

          <AdTestList
            adTests={adTests}
            getStatusColor={getStatusColor}
            selectExperiment={selectExperiment}
            selectTest={selectTest}
            isLoading={isLoadingAdTests}
          />
        </div>
      </main>
    </Navbar>
  );
}