"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Badge } from '@/components/ui/badge';
import { AdCreation, AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { useRouter } from 'next/navigation';
import { Beaker } from 'lucide-react';
import AdTestList from '@/components/create/testing/AdTestList';
import { PageHeader } from '@/components/ui/pageHeader';

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

          <PageHeader 
            text="Let's review our ad tests!"
            rightItem={
              <div className="flex items-center space-x-2 mr-2">
                <Beaker className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {adTests.length} Tests
                </span>
              </div>
            }
          />

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