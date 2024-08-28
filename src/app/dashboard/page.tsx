"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { PageHeader } from '@/components/ui/pageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkle, Beaker, TrendingUp, DollarSign } from 'lucide-react';
import { AdCreation, AdDeploymentWithCreation } from '@/lib/types/customTypes';
import TrendingTopics from '@/components/research/conversations/TrendingTopics';
import RecentAds from '@/components/research/ads/RecentAds';
import AdExperimentList from '@/components/create/generate/AdExperimentList';
import AdTestList from '@/components/create/testing/AdTestList';
import AdDeploymentList from '@/components/deployment/AdDeploymentList';
import { AdDeployment } from '@/lib/types/customTypes';
import HotIssues from '@/components/research/conversations/HotIssues';
import PoliticalLeanings from '@/components/research/ads/PoliticalLeanings';
import { TextSelect, PencilLine, Rocket } from 'lucide-react';

import { HotIssue, PoliticalLeaning } from '@/lib/types/customTypes'; 

interface DashboardData {
  hotIssues: HotIssue[];
  politicalLeanings: PoliticalLeaning[];
  adExperiments: (AdCreation & { tests: string[] })[];
  adTests: AdDeploymentWithCreation[];
  deployments: AdDeploymentWithCreation[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    hotIssues: [],
    politicalLeanings: [],
    adExperiments: [],
    adTests: [],
    deployments: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        hotIssues,
        politicalLeanings,
        adExperiments,
        adTests,
        deployments
      ] = await Promise.all([
        fetchHotIssues(),
        fetchPoliticalLeanings(),
        fetchAdExperiments(),
        fetchAdTests(),
        fetchDeployments()
      ]);

      setData({
        hotIssues,
        politicalLeanings,
        adExperiments: adExperiments?.map((experiment) => ({
            ...experiment,
            tests: experiment.tests ?? []
          })) ?? [],
          adTests,
        deployments
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotIssues = async () => {
    const { data } = await supabase
      .from('ai_conversations_data')
      .select('hot_issues')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data?.hot_issues || [];
  };

  const fetchPoliticalLeanings = async () => {
    const { data } = await supabase
      .from('ai_ads_data')
      .select('political_leanings')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data?.political_leanings || [];
  };

  const fetchAdExperiments = async () => {
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
        return(data?.map(experiment => ({
          ...experiment,
          tests: experiment.tests?.map((test: AdDeployment) => test.id) || []
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching ad experiments:', error);
      return [];
    }
  };

  const fetchAdTests = async () => {
    const { data } = await supabase
      .from('ad_deployments')
      .select('*, creation:ad_creations(*)')
      .eq('type', 'Test')
      .order('created_at', { ascending: false })
      .limit(5);
    return data || [];
  };

  const fetchDeployments = async () => {
    const { data } = await supabase
      .from('ad_deployments')
      .select('*, creation:ad_creations(*)')
      .in('status', ['Deployed', 'Running', 'Paused', 'Complete'])
      .order('created_at', { ascending: false })
      .limit(5);
    return data || [];
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

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-[1500px] mx-auto p-6">
          <PageHeader 
            text={`${getGreeting()}, welcome to lightspeed!`}
            rightItem={
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Sparkle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">{data.adExperiments.length} Creations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Beaker className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">{data.adTests.length} Tests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">{data.deployments.length} Deployments</span>
                </div>
              </div>
            }
          />

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-4">
            <div>
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <TextSelect className="w-4 h-4 mr-2" />
                <span>Research</span>
              </div>
              <HotIssues issues={data.hotIssues} isLoading={isLoading} />
            </div>
            <div>
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <TextSelect className="w-4 h-4 mr-2" />
                <span>Research</span>
              </div>
              <PoliticalLeanings leanings={data.politicalLeanings} isLoading={isLoading} dashboard={true} />
            </div>
          </div>

          <Tabs defaultValue="creations" className="mt-6 pt-5 py-3">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-gray-200 p-1 mb-4">
                  <TabsTrigger 
                    value="creations" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Creations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tests" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    A/B Tests
                  </TabsTrigger>
                  <TabsTrigger 
                    value="deployments" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Deployments
                  </TabsTrigger>
                </TabsList>
            <TabsContent value="creations">
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <PencilLine className="w-4 h-4 mr-2" />
                <span>Create</span>
              </div>
              <Card>
                <CardContent className="p-4">
                  <AdExperimentList
                    adExperiments={data.adExperiments}
                    getStatusColor={getStatusColor}
                    getFlowColor={getStatusColor}
                    selectExperiment={() => {}}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tests">
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <PencilLine className="w-4 h-4 mr-2" />
                <span>Create</span>
              </div>
              <Card>
                <CardContent className="p-4">
                  <AdTestList
                    adTests={data.adTests}
                    getStatusColor={getStatusColor}
                    selectExperiment={() => {}}
                    selectTest={() => {}}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="deployments">
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <Rocket className="w-4 h-4 mr-2" />
                <span>Deployments</span>
              </div>
              <Card>
                <CardContent className="p-4">
                  <AdDeploymentList
                    deployments={data.deployments}
                    getStatusColor={getStatusColor}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}