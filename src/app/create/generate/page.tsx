"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Badge } from '@/components/ui/badge';
import { AdCreation, AdDeployment } from '@/lib/types/customTypes';
import { useRouter } from 'next/navigation';
import { WalletCards } from 'lucide-react';
import AdExperimentList from '@/components/create/generate/AdExperimentList';

export default function GeneratePage() {
  const [adExperiments, setAdExperiments] = useState<(AdCreation & { tests: string[] })[]>([]);
  const router = useRouter();
  const [isLoadingAdExperiments, setIsLoadingAdExperiments] = useState(false);

  useEffect(() => {
    fetchAdExperiments();
  }, []);

  const fetchAdExperiments = async () => {
    setIsLoadingAdExperiments(true);
    try {
      const { data, error } = await supabase
        .from('ad_creations')
        .select(`
          *,
          tests:ad_deployments(id)
        `)
        .eq('ad_deployments.type', 'Test')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ad experiments:', error);
      } else {
        setAdExperiments(data?.map(experiment => ({
          ...experiment,
          tests: experiment.tests?.map((test: AdDeployment) => test.id) || []
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching ad experiments:', error);
      setAdExperiments([]);
    } finally {
      setIsLoadingAdExperiments(false);
    }
  };

  const selectExperiment = (experiment: AdCreation) => {
    console.log(experiment);
    router.push(`/create/generate/${experiment.id}`);
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

  const getFlowColor = (flow: string) => {
    const colors = {
      'Ideation': 'bg-teal-100 text-teal-800',
      'Generation': 'bg-indigo-100 text-indigo-800',
      'Testing': 'bg-amber-100 text-amber-800',
      'Deployment': 'bg-rose-100 text-rose-800',
    };
    return colors[flow as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-[1500px] mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Let&apos;s whip up some ads and see what real people think!
              </h1>
            </div>
          </header>

          <div className="mt-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <WalletCards className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Creations</h2>
              </div>
              <Badge variant="outline" className="text-sm font-medium bg-blue-500 text-white">
                {adExperiments.length} Advertisements
              </Badge>
            </div>
            <div className="h-px bg-gray-200 mt-2"></div>
          </div>

          <AdExperimentList
            adExperiments={adExperiments}
            getStatusColor={getStatusColor}
            getFlowColor={getFlowColor}
            selectExperiment={selectExperiment}
            isLoading={isLoadingAdExperiments}
          />
        </div>
      </main>
    </Navbar>
  );
}