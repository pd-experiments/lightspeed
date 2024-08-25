"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, DollarSign, Share, ChevronRight, Beaker, Clock, WalletCards, PlayCircle, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { AdCreation } from '@/lib/types/customTypes';
import { useRouter } from 'next/navigation';
import _ from 'lodash';

export default function GenerateTestPage() {
  const [adExperiments, setAdExperiments] = useState<AdCreation[]>([]);
  const [adTests, setAdTests] = useState<Database['public']['Tables']['ad_deployments']['Row'][]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchAdExperiments();
    fetchAdTests();
  }, []);

  const fetchAdExperiments = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ad experiments:', error);
    } else {
      setAdExperiments(data || []);
    }
  };


  const fetchAdTests = async () => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .select('*')
      .eq('type', 'Test')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ad tests:', error);
    } else {
      setAdTests(data || []);
    }
  };

  const selectExperiment = (experiment: AdCreation) => {
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
        <div className="max-w-7xl mx-auto p-4">
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
                          <Badge variant="outline" className="text-xs">
                            {experiment.tests?.length || 0} Test Results
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                          onClick={() => selectExperiment(experiment)}
                        >
                          {experiment.status === 'Configured' ? 'Generate' : experiment.status === 'Generated' ? experiment.flow === 'Testing' ? 'Continue Testing' : 'Review & Proceed To Testing' : experiment.status === 'Test' ? 'Continue Building Tests' : 'View'}
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
              <Badge variant="outline" className="text-sm font-medium bg-blue-500 text-white">
                {adTests.length} Tests
              </Badge>
            </div>
            <div className="h-px bg-gray-200 mt-2"></div>
          </div>
          <div className="space-y-4">
            {adTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Test #{test.id.slice(0, 8)}</h3>
                    <Badge className={`${getStatusColor(test.status)} text-xs font-medium px-2 py-1`}>
                      {_.startCase(_.toLower(test.status))}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
                    {/* {test.target_audience && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-gray-400" />
                        {test.target_audience}
                      </div>
                    )}
                    {test.versions && (
                      <Badge variant="outline" className="text-xs">
                        {test.versions.length} Versions
                      </Badge>
                    )}
                    {test.results && (
                      <Badge variant="outline" className="text-xs">
                        {test.results.length} Results
                      </Badge>
                    )} */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap ml-auto"
                      onClick={() => selectTest(test.id)}
                    >
                      {test.status === 'Created' ? 'Deploy Test' : test.status === 'Running' ? 'View Progress' : 'View Results'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </Navbar>
  );
}