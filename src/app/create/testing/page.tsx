"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { AdCreation, AdDeploymentWithCreation, AdDeployment, Platform } from '@/lib/types/customTypes';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, FileText, Zap, ArrowLeft, Tag, WalletCards, Share, Beaker, GalleryHorizontalEnd } from 'lucide-react';

export default function GenerateTestPage() {
  const [adExperiments, setAdExperiments] = useState<(AdCreation & { tests: string[] })[]>([]);  
  const [adTests, setAdTests] = useState<AdDeploymentWithCreation[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchAdExperiments();
    fetchAdTests();
  }, []);

  const fetchAdExperiments = async () => {
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
  };

  const fetchAdTests = async () => {
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
  };

  const selectExperiment = (experiment: AdCreation) => {
    console.log(experiment);
    router.push(`/create/testing/${experiment.id}`);
  };

  const selectTest = (testId: string) => {
    router.push(`/create/testing/test/${testId}`);
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
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-[1500px] mx-auto p-4">
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
          <div className="space-y-4">
            {adExperiments.filter((experiment) => experiment.flow == "Generation" || experiment.flow == "Testing").map((experiment) => (
              <Card key={experiment.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {experiment.ad_content?.image ? (
                        <Image
                          src={typeof experiment.ad_content.image === 'string' ? experiment.ad_content.image : URL.createObjectURL(experiment.ad_content.image)}
                          alt="Ad preview"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-2">{experiment.title}</h3>
                        <div className="flex-shrink-0 flex space-x-2">
                          <Badge className={`${getStatusColor(experiment.status)} text-xs shadow-sm`}>
                            {experiment.status}
                          </Badge>
                          <Badge className={`${getFlowColor(experiment.flow)} text-xs shadow-sm`}>
                            Working on {experiment.flow}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{experiment.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {experiment.target_audience?.location || 'No location'}
                        </div>
                        <div className="flex items-center">
                          <Share className="w-3 h-3 mr-1" />
                          <span className="truncate">{experiment.platforms.join(', ') || 'No platforms'}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span className="font-semibold">${experiment.budget}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Badge variant="outline" className={`text-xs ${experiment.version_data?.versions?.length || 0 > 0 ? 'bg-blue-500 text-white' : ''}`}>
                            {experiment.version_data?.versions?.length || 0} Versions
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-orange-500 bg-opacity-80 text-white hover:bg-orange-600 hover:bg-opacity-100">
                            <Beaker className="w-3 h-3 mr-1" />{experiment.tests?.length || 0} Associated Tests
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                          onClick={() => selectExperiment(experiment)}
                        >
                          {experiment.status === 'Configured' ? 'Generate' :
                          experiment.status === 'Generated' && experiment.flow === 'Testing' ? 
                            (experiment.tests?.length > 0 ? 'See Testing Configuration' : 'Continue Testing') :
                          experiment.status === 'Test' ? 'Continue Building Tests' : 'View'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 mb-6">
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
          <div className="space-y-4">
            {adTests.map((test) => (
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
                          <Badge className={`${getStatusColor(test.creation.status)} text-xs shadow-sm`}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1 mb-1">{test.creation.description}</p>
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
                            variant="outline"
                            size="sm"
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => selectExperiment(test.creation)}
                          >
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            See Associated Creation
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            onClick={() => selectTest(test.id)}
                          >
                            {test.status === 'Deployed' ? 'View Deployment' : test.status === 'Running' ? 'View Progress' : test.status === 'Created' ? 'Deploy Test' : 'View'}
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
                      onClick={() =>  selectTest(test.id)}
                    >
                      <GalleryHorizontalEnd className="w-4 h-4 mr-2" />
                      Move to Standard Deployment
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
    </Navbar>
  );
}