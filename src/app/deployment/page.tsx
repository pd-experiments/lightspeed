"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { AdDeploymentWithCreation } from '@/lib/types/customTypes';
import AdDeploymentList from '@/components/deployment/AdDeploymentList';

export default function DeploymentPage() {
  const [deployments, setDeployments] = useState<AdDeploymentWithCreation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('ad_deployments')
      .select(`
        *,
        creation:ad_creations(*)
      `)
      .eq('type', 'Standard')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deployments:', error);
    } else {
      setDeployments(data || []);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-green-100 text-green-800',
      'Deployed': 'bg-blue-100 text-blue-800',
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
                Take a look at your deployed advertisements!
              </h1>
            </div>
          </header>
          <AdDeploymentList deployments={deployments} getStatusColor={getStatusColor} isLoading={isLoading} />
        </div>
      </main>
    </Navbar>
  );
}