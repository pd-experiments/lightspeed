"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Beaker, ChevronLeft, ChevronRight, Sparkle } from 'lucide-react';
import AdVersionGenerator from '@/components/create/testing/AdVersionGenerator';
import TestingDashboard from '@/components/create/testing/TestingDashboard';
import { AdCreation, AdDeploymentWithCreation, Platform} from '@/lib/types/customTypes';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import AdTestBuilder from '@/components/create/testing/AdTestBuilder';
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Tag, DollarSign, Users, Zap, BarChart, ArrowLeft, GalleryHorizontalEnd } from 'lucide-react';
import { FiExternalLink } from "react-icons/fi";
import { PageHeader } from '@/components/ui/pageHeader';
import { AdDeployment } from '@/lib/types/customTypes';

export default function ExperimentPage({ params }: { params: { id: string } }) {
  const [experiment, setExperiment] = useState<(AdCreation & { tests: AdDeploymentWithCreation[]; standard: AdDeploymentWithCreation[] }) | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'test'>('generate');
  const router = useRouter();

  useEffect(() => {
    fetchExperiment();
  }, []);

  const fetchExperiment = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select(`
        *,
        deployments:ad_deployments(*)
      `)
      .eq('id', params.id)
      .single();
  
    if (error) {
      console.error('Error fetching experiment:', error);
    } else if (data) {
      const experiment = {
        ...data,
        tests: data.deployments.filter((d: AdDeployment) => d.type === 'Test'),
        standard: data.deployments.filter((d: AdDeployment) => d.type === 'Standard')
      };
      setExperiment(experiment);
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
        setExperiment({ ...updatedExperiment, tests: experiment.tests, standard: experiment.standard });
        setActiveTab('test');
    }
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

  const updateType = async (id: string, type: string) => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .update({ type: type })
      .eq('id', id)
      .select()
      .single();
  };

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-[1500px] mx-auto p-4">
          <PageHeader 
            text={activeTab === 'generate' 
              ? `Alright, let's cook up some ad magic for "${experiment?.title}"!`
              : `Time to put "${experiment?.title}" to the test and see what resonates!`}
            rightItem={
              <div className="flex items-center space-x-2">
                <Link href="/create/generate">
                  <Button variant="ghost" className="text-gray-600">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back to Experiments
                  </Button>
                </Link>
              </div>
            }
          />

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'generate' | 'test')}>
            <TabsList className="inline-flex h-14 items-center w-full space-x-1">
            <TabsTrigger value="generate" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'generate' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
              <Sparkle className="h-4 w-4 mr-2" />
              Generate Versions
            </TabsTrigger>
            <TabsTrigger value="test" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'test' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
              <Beaker className="h-4 w-4 mr-2" />
              Build New Tests
            </TabsTrigger>
          </TabsList>
            <TabsContent value="generate">
              <div className="bg-transparent rounded-lg mb-4">
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
              <div className="bg-transparent rounded-lg mb-4 space-y-3">
                <Accordion type="single" collapsible className="w-full space-y-2 bg-orange-50">
                  <AccordionItem value="item-1" className="border rounded-md">
                    <AccordionTrigger className="hover:no-underline px-4 py-2">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center font-medium text-gray-800 space-x-2">
                          <Beaker className="w-4 h-4 text-orange-500" />
                          <span>View Associated Tests</span>
                          <FiExternalLink className="w-4 h-4 text-orange-500 mb-1 hover:cursor-pointer hover:text-orange-700 hover:scale-105 transition-all duration-300" onClick={() => router.push(`/create/testing/`)}/>
                        </div>
                        <Badge variant="outline" className="ml-2 bg-orange-500 text-white">
                          {experiment?.tests?.length || 0}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      {experiment && experiment.tests && experiment.tests.length > 0 ? (
                        <div className="space-y-4">
                          {experiment.tests.map((test) => (
                            <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    {getPlatformIcon(test.platform as Platform, 10)}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-lg font-semibold text-gray-800">Test #{test.id.slice(0, 8)}</h3>
                                      <div className="flex-shrink-0 flex space-x-2">
                                        <Badge className={`${getStatusColor(test.status || '')} text-xs shadow-sm`}>
                                          {test.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                                      <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center">
                                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                          {new Date(test.created_at || '').toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center">
                                          <Tag className="w-3 h-3 mr-1 text-gray-400" />
                                          {test.platform}
                                        </div>
                                        {test.budget && (
                                          <div className="flex items-center">
                                            <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                                            <span className="font-semibold">${test.budget}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center">
                                          <Users className="w-3 h-3 mr-1 text-gray-400" />
                                          {test.audience}
                                        </div>
                                        <div className="flex items-center">
                                          <Zap className="w-3 h-3 mr-1 text-gray-400" />
                                          <span>{test.bid_strategy}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <BarChart className="w-3 h-3 mr-1 text-gray-400" />
                                          <span>{test.placement}</span>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                                          onClick={() => router.push(`/create/testing/${test.id}`)}
                                        >
                                          {test.status === 'Deployed' ? 'View Deployment' : test.status === 'Running' ? 'View Progress' : test.status === 'Created' ? 'Review & Deploy Test' : 'View'}
                                          <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                              {test.type === 'Test' && test.status === 'Deployed' && (
                                <div className="flex justify-end rounded-b-md bg-gray-100 p-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-100 shadow-sm whitespace-nowrap font-semibold"
                                    onClick={() => updateType(test.id, 'Standard')}
                                  >
                                    <GalleryHorizontalEnd className="w-4 h-4 mr-2" />
                                    Move to Standard Deployment
                                  </Button>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No tests associated with this experiment yet.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible className="w-full space-y-2 bg-blue-50">
                  <AccordionItem value="item-1" className="border rounded-md">
                    <AccordionTrigger className="hover:no-underline px-4 py-2">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center font-medium text-gray-800 space-x-2">
                          <Beaker className="w-4 h-4 text-blue-500" />
                          <span>View Associated Standard Deployments</span>
                          <FiExternalLink className="w-4 h-4 text-blue-500 mb-1 hover:cursor-pointer hover:text-blue-700 hover:scale-105 transition-all duration-300" onClick={() => router.push(`/deployment/`)}/>
                        </div>
                        <Badge variant="outline" className="ml-2 bg-blue-500 text-white">
                          {experiment?.standard?.length || 0}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      {experiment && experiment.standard && experiment.standard.length > 0 ? (
                        <div className="space-y-4">
                          {experiment.standard.map((test) => (
                            <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    {getPlatformIcon(test.platform as Platform, 10)}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-lg font-semibold text-gray-800">Test #{test.id.slice(0, 8)}</h3>
                                      <div className="flex-shrink-0 flex space-x-2">
                                        <Badge className={`${getStatusColor(test.status || '')} text-xs shadow-sm`}>
                                          {test.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                                      <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center">
                                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                          {new Date(test.created_at || '').toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center">
                                          <Tag className="w-3 h-3 mr-1 text-gray-400" />
                                          {test.platform}
                                        </div>
                                        {test.budget && (
                                          <div className="flex items-center">
                                            <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                                            <span className="font-semibold">${test.budget}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center">
                                          <Users className="w-3 h-3 mr-1 text-gray-400" />
                                          {test.audience}
                                        </div>
                                        <div className="flex items-center">
                                          <Zap className="w-3 h-3 mr-1 text-gray-400" />
                                          <span>{test.bid_strategy}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <BarChart className="w-3 h-3 mr-1 text-gray-400" />
                                          <span>{test.placement}</span>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                                          onClick={() => router.push(`/deployment/${test.id}`)}
                                        >
                                          {test.status === 'Deployed' ? 'View Deployment' : test.status === 'Running' ? 'View Progress' : test.status === 'Created' ? 'Review & Deploy Test' : 'View'}
                                          <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No standard deployments associated with this experiment yet.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {experiment && <AdTestBuilder experiment={experiment} fetchExperiment={fetchExperiment}/>}
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