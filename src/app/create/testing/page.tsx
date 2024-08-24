"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, FileText, Users, DollarSign, Share, ChevronRight, Wand2, TestTube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdVersionGenerator from '@/components/create/testing/AdVersionGenerator';

type AdExperiment = Database['public']['Tables']['ad_experiments']['Row'];

export default function GenerateTestPage() {
  const [adExperiments, setAdExperiments] = useState<AdExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<AdExperiment | null>(null);
  const [currentStep, setCurrentStep] = useState(selectedExperiment ? selectedExperiment.flow === "Generation" ? 0 : 1 : 0);

  useEffect(() => {
    fetchAdExperiments();
  }, []);

  const fetchAdExperiments = async () => {
    const { data, error } = await supabase
      .from('ad_experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ad experiments:', error);
    } else {
      setAdExperiments(data || []);
    }
  };

  const selectExperiment = (experiment: AdExperiment) => {
    setSelectedExperiment(experiment);
    setCurrentStep(experiment.flow === "Generation" ? 0 : 1);
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

  const handleMoveToTesting = async () => {
    setCurrentStep(1);
    await supabase
      .from('ad_experiments')
      .update({ flow: 'Testing' })
      .eq('id', selectedExperiment?.id);
  };

  const steps = [
    { title: 'Generate', icon: <Wand2 className="h-6 w-6" /> },
    { title: 'Test', icon: <TestTube className="h-6 w-6" /> },
  ];

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                {selectedExperiment 
                  ? (currentStep === 0 
                      ? `Alright, let's cook up some ad magic for "${selectedExperiment.title}"!` 
                      : `Time to put "${selectedExperiment.title}" to the test and see what resonates!`)
                  : "Let's whip up some ads and see what real people think!"}
              </h1>
              {selectedExperiment && (
                <Button variant="ghost" className="text-gray-600" onClick={() => setSelectedExperiment(null)}>
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back to Experiments
                </Button>
              )}
            </div>
          </header>

          {selectedExperiment ? (
            <div className="mt-2">
              <div className="bg-transparent rounded-lg p-3 mb-4">
                {currentStep === 0 ? (
                  <AdVersionGenerator experiment={selectedExperiment} />
                ) : (
                  <div>
                     <h2 className="text-xl font-semibold mb-4">Testing Component</h2>
                    <p>Implement testing logic here.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                    {currentStep > 0 && (
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="text-blue-600 hover:text-blue-800 whitespace-nowrap font-semibold"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Modify Generation
                    </Button>
                    )}
                </div>
                <div>
                    {currentStep === steps.length - 1 ? (
                    <Button
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 whitespace-nowrap font-semibold"
                        onClick={() => {/* Handle completion */}}
                    >
                        Proceed with Deployment <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    ) : (
                    <Button
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 whitespace-nowrap font-semibold"
                        onClick={handleMoveToTesting}
                    >
                        Confirm & Proceed To Testing <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {adExperiments.filter((experiment) => experiment.flow == "Generation" || experiment.flow == "Testing").map((experiment) => (
                <Card key={experiment.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {experiment.ad_content.image ? (
                          <img src={experiment.ad_content.image} alt="Ad preview" className="w-full h-full object-cover" />
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
                            {experiment.target_audience.location || 'No location'}
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
                              {experiment.test_results?.length || 0} Test Results
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            onClick={() => selectExperiment(experiment)}
                          >
                            {experiment.status === 'Configured' ? 'Generate' : experiment.status === 'Generated' ? experiment.flow === 'Testing' ? 'Continue Testing' : 'Review & Proceed To Testing' : experiment.status === 'Test' ? 'Confirm & Deploy' : 'View Results'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </Navbar>
  );
}