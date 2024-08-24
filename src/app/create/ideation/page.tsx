"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { PlusIcon, Users, Calendar, Tag, ChevronRight, FileText, ChevronLeft, Info, DollarSign, Share, Lightbulb, GalleryHorizontalEnd } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent} from '@/components/ui/card';
import _ from 'lodash';

import { AdSuggestions } from '@/components/create/ideation/AdSuggestions';

import BasicInformationStep from '@/components/create/ideation/BasicInformationStep';
import BudgetAndTimelineStep from '@/components/create/ideation/BudgetAndTimelineStep';
import TargetAudienceStep from '@/components/create/ideation/TargetAudienceStep';
import AdContentStep from '@/components/create/ideation/AdContentStep';
import PlatformsAndLeaningStep from '@/components/create/ideation/PlatformsAndLeaningStep';
import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';

type AdExperiment = Database['public']['Tables']['ad_experiments']['Row'];
type AdExperimentInsert = Database['public']['Tables']['ad_experiments']['Insert'];

export default function IdeationPage() {
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [adDrafts, setAdDrafts] = useState<AdExperiment[]>([]);
  const [adExperiment, setAdExperiment] = useState<AdExperimentInsert>({
    title: '',
    description: '',
    objective: 'awareness',
    budget: 0,
    duration: 0,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    target_audience: {
      age: [],
      gender: [],
      interests: [],
      location: '',
    },
    ad_content: {
      headline: '',
      body: '',
      callToAction: '',
      image: null,
    },
    platforms: [],
    political_leaning: 'center',
    key_components: [],
    status: 'Draft',
  });
  const [adSuggestions, setAdSuggestions] = useState<AdExperimentInsert[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchAdDrafts();
  }, []);

  const fetchAdDrafts = async () => {
    const { data, error } = await supabase
      .from('ad_experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ad drafts:', error);
    } else {
      setAdDrafts(data || []);
    }
  };

  const fetchAdSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/create/ideation/generate-ad-suggestions');
      const data = await response.json();
      setAdSuggestions(data);
    } catch (error) {
      console.error('Error fetching ad suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);
  
  useEffect(() => {
    fetchAdSuggestions();
  }, [fetchAdSuggestions]);

  const createEmptyAdExperiment = async () => {
    const { data: existingDrafts } = await supabase
      .from('ad_experiments')
      .select('title')
      .like('title', 'Untitled%')
      .order('title', { ascending: false });

    const nextNumber = existingDrafts ? existingDrafts.length + 1 : 1;
    const newTitle = `Untitled #${nextNumber}`;

    const newAdExperiment: AdExperimentInsert = {
      ...adExperiment,
      title: newTitle,
    };

    const { data, error } = await supabase
      .from('ad_experiments')
      .insert(newAdExperiment)
      .select()
      .single();

    if (error) {
      console.error('Error creating empty ad experiment:', error);
    } else if (data) {
      setAdDrafts([data, ...adDrafts]);
      setAdExperiment(data);
      setIsCreatingExperiment(true);
      setCurrentStep(0);
    }
  };

  const loadAdExperiment = async (id: number) => {
    const { data, error } = await supabase
      .from('ad_experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading ad experiment:', error);
    } else if (data) {
      setAdExperiment(data);
      setIsCreatingExperiment(true);
      setCurrentStep(0);
    }
  };

  const getPoliticalLeaningColor = (leaning: string) => {
    const colors = {
      'left': 'bg-blue-100 text-blue-800',
      'center-left': 'bg-teal-100 text-teal-800',
      'center': 'bg-purple-100 text-purple-800',
      'center-right': 'bg-orange-100 text-orange-800',
      'right': 'bg-red-100 text-red-800',
    };
    return colors[leaning as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const updateExperiment = async (updatedExperiment: Partial<AdExperimentInsert>) => {
    if (!adExperiment.id) return;

    const { data, error } = await supabase
      .from('ad_experiments')
      .update(updatedExperiment)
      .eq('id', adExperiment.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ad experiment:', error);
    } else if (data) {
      setAdExperiment(data);
      setAdDrafts(adDrafts.map(ad => ad.id === data.id ? data : ad));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedExperiment = { ...adExperiment, [name]: value };
    setAdExperiment(updatedExperiment);
    updateExperiment({ [name]: value });
  };

  const handleNestedInputChange = (category: 'target_audience' | 'ad_content', name: string, value: any) => {
    const updatedExperiment = {
      ...adExperiment,
      [category]: { ...adExperiment[category], [name]: value },
    };
    setAdExperiment(updatedExperiment);
    updateExperiment({ [category]: updatedExperiment[category] });
  };

  const handleMultiSelectChange = (name: 'platforms' | 'key_components', value: string[]) => {
    const updatedExperiment = { ...adExperiment, [name]: value };
    setAdExperiment(updatedExperiment);
    updateExperiment({ [name]: value });
  };

  const handleSubmit = async () => {
    const { data, error } = adExperiment.id
      ? await supabase
          .from('ad_experiments')
          .update(adExperiment)
          .eq('id', adExperiment.id)
          .select()
          .single()
      : await supabase
          .from('ad_experiments')
          .insert(adExperiment)
          .select()
          .single();
  
    if (error) {
      console.error('Error saving ad experiment:', error);
    } else if (data) {
      if (adExperiment.id) {
        setAdDrafts(adDrafts.map(ad => ad.id === data.id ? data : ad));
      } else {
        setAdDrafts([data, ...adDrafts]);
      }
      setIsCreatingExperiment(false);
      setCurrentStep(0);
      setAdExperiment({
        title: '',
        description: '',
        objective: 'awareness',
        budget: 0,
        duration: 0,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        target_audience: {
          age: [],
          gender: [],
          interests: [],
          location: '',
        },
        ad_content: {
          headline: '',
          body: '',
          callToAction: '',
          image: null,
        },
        platforms: [],
        political_leaning: 'center',
        key_components: [],
        status: 'Draft',
      });
    }
  };

  type StepProps = {
    adExperiment: AdExperimentInsert;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNestedInputChange: (category: 'target_audience' | 'ad_content', name: string, value: any) => void;
    handleMultiSelectChange: (name: 'platforms' | 'key_components', value: string[]) => void;
  };

  const steps: { title: string; component: React.ComponentType<StepProps>; icon: React.ReactNode }[] = [
    { title: 'Basic Information', component: BasicInformationStep, icon: <Info className="h-6 w-6" /> },
    { title: 'Budget and Timeline', component: BudgetAndTimelineStep, icon: <DollarSign className="h-6 w-6" /> },
    { title: 'Target Audience', component: TargetAudienceStep, icon: <Users className="h-6 w-6" /> },
    { title: 'Ad Content', component: AdContentStep, icon: <FileText className="h-6 w-6" /> },
    { title: 'Platforms and Political Leaning', component: PlatformsAndLeaningStep, icon: <Share className="h-6 w-6" /> },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                {isCreatingExperiment
                  ? adExperiment.id
                    ? `${adExperiment.title}`
                    : 'Create New Ad Experiment'
                  : 'Would you like to start creating your ad experiment?'}
              </h1>
              {!isCreatingExperiment ? (
                <Button onClick={createEmptyAdExperiment}>
                  <Lightbulb className="mr-2 h-4 w-4" /> Create New Ad Experiment
                </Button>
              ) : (
                <Button variant="ghost" className="text-gray-600" onClick={() => setIsCreatingExperiment(false)}>
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back to Experiments
                </Button>
              )}
            </div>
          </header>
          
          {isCreatingExperiment ? (
            <div className="mt-8">
              <div className="flex justify-between mb-8">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className={`rounded-full p-2 ${currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step.icon}
                    </div>
                    <span className={`text-sm mt-2 ${currentStep === index ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6 mb-8">
                <CurrentStepComponent
                  adExperiment={adExperiment}
                  handleInputChange={handleInputChange}
                  handleNestedInputChange={handleNestedInputChange}
                  handleMultiSelectChange={handleMultiSelectChange}
                />
              </div>
              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentStep === steps.length - 1 ? null : (
                  <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <AdSuggestions
                  suggestions={adSuggestions}
                  isLoading={isLoadingSuggestions}
                  onSelect={(suggestion) => {
                    setAdExperiment(suggestion);
                    setIsCreatingExperiment(true);
                    setCurrentStep(0);
                  }}
                />
              </div>
              <div className="space-y-4">
                {adDrafts.filter((experiment) => experiment.flow == "Ideation").map((ad) => (
                  <Card key={ad.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-semibold truncate">{ad.title}</h3>
                        <div className="flex space-x-1">
                          <Badge className={`${getPoliticalLeaningColor(ad.political_leaning)} text-xs`}>
                            {_.startCase(_.toLower(ad.political_leaning))}
                          </Badge>
                          <Badge className={`${getStatusColor(ad.status)} text-xs`}>
                            {_.startCase(_.toLower(ad.status))}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1 mb-1">{ad.description}</p>
                      <div className="flex justify-between items-end">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(ad.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {ad.target_audience.location}
                          </div>
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            <span className="truncate">{ad.key_components.join(', ')}</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            <span className="truncate">{ad.platforms.join(', ')}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span className="font-semibold">${ad.budget}</span>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            onClick={() => loadAdExperiment(ad.id)}
                          >
                            {ad.status === 'Draft' ? 'Keep Working' : ad.status === 'In Review' ? 'Review' : 'Modify'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                      {ad.status === 'Configured' && (
                        <div className="flex justify-end rounded-b-md bg-gray-100 p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-100 shadow-sm whitespace-nowrap font-semibold"
                            onClick={() => loadAdExperiment(ad.id)}
                          >
                            <GalleryHorizontalEnd className="w-4 h-4 mr-2" />
                            Move to Generation
                          </Button>
                        </div>
                      )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </Navbar>
  );
}