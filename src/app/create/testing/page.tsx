"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, FileText, Users, DollarSign, Share, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdVersionGenerator from '@/components/create/testing/AdVersionGenerator';

type AdExperiment = Database['public']['Tables']['ad_experiments']['Row'];

export default function GenerateTestPage() {
  const [adExperiments, setAdExperiments] = useState<AdExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<AdExperiment | null>(null);

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
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Configured': 'bg-blue-100 text-blue-800',
      'Generating': 'bg-yellow-100 text-yellow-800',
      'Testing': 'bg-purple-100 text-purple-800',
      'Deployed': 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
              {selectedExperiment 
                ? `Alright, let's cook up some ad magic for "${selectedExperiment.title}"!` 
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
            <AdVersionGenerator experiment={selectedExperiment} />
          ) : (
            <div className="mt-3 space-y-4">
              {adExperiments.filter((experiment) => experiment.status === 'Configured' || experiment.status === 'Generating' || experiment.status === 'Testing' || experiment.status === 'Deployed').map((experiment) => (
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
                          <h3 className="text-lg font-semibold text-gray-900">{experiment.title}</h3>
                          <Badge className={`${getStatusColor(experiment.status)} text-xs`}>
                            {experiment.status}
                          </Badge>
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
                            <Badge variant="outline" className="text-xs">
                              {experiment.ad_versions?.length || 0} Versions
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
                            {experiment.status === 'Configured' ? 'Generate' : experiment.status === 'Generating' ? 'Test' : experiment.status === 'Testing' ? 'Confirm & Deploy' : 'View Results'}
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