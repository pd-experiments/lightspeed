"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { PlusIcon, Users, Calendar, Tag, ChevronRight, FileText, ChevronLeft, Info, DollarSign, Share, Lightbulb, GalleryHorizontalEnd, Network, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent} from '@/components/ui/card';
import _ from 'lodash';
import { Tables } from '@/lib/types/schema';
import { calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';
import AdDraftList from '@/components/create/ideation/AdDraftList';

type Outline = Tables<'outline'>;
interface OutlineWithDetails extends Outline {
  elementCount: number;
  totalDuration: number;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OutlineList from '@/components/create/outline/OutlineList';

import { AdSuggestions } from '@/components/create/ideation/AdSuggestions';

import BasicInformationStep from '@/components/create/ideation/BasicInformationStep';
import BudgetAndTimelineStep from '@/components/create/ideation/BudgetAndTimelineStep';
import TargetAudienceStep from '@/components/create/ideation/TargetAudienceStep';
import AdContentStep from '@/components/create/ideation/AdContentStep';
import PlatformsAndLeaningStep from '@/components/create/ideation/PlatformsAndLeaningStep';
import { useCallback } from 'react';
import { AdCreationInsert, AdCreation } from '@/lib/types/customTypes';
import { OutlineCreator } from '@/components/create/outline/OutlineCreator';
import ClipSearchComponent from '@/components/ClipSearchComponent';

export default function IdeationPage() {
  const [mode, setMode] = useState<'social-media' | 'television'>('social-media');
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [adDrafts, setAdDrafts] = useState<AdCreation[]>([]);
  const [adExperiment, setAdExperiment] = useState<AdCreationInsert>({
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
  const [adSuggestions, setAdSuggestions] = useState<AdCreationInsert[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [adSuggestionsError, setAdSuggestionsError] = useState(false);

  useEffect(() => {
    fetchAdDrafts();
  }, []);

  const fetchAdDrafts = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAdSuggestions(data);
    } catch (error) {
      console.error('Error fetching ad suggestions:', error);
      setAdSuggestions([]);
      setAdSuggestionsError(true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);
  
  useEffect(() => {
    fetchAdSuggestions();
  }, [fetchAdSuggestions]);

  const createEmptyAdExperiment = async () => {
    const { data: existingDrafts } = await supabase
      .from('ad_creations')
      .select('title')
      .like('title', 'Untitled%')
      .order('title', { ascending: false });

    const nextNumber = existingDrafts ? existingDrafts.length + 1 : 1;
    const newTitle = `Untitled #${nextNumber}`;

    const newAdExperiment: AdCreationInsert = {
      ...adExperiment,
      title: newTitle,
    };

    const { data, error } = await supabase
      .from('ad_creations')
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
      .from('ad_creations')
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

  const updateExperiment = async (updatedExperiment: Partial<AdCreationInsert>) => {
    if (!adExperiment.id) return;

    const { data, error } = await supabase
      .from('ad_creations')
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
      [category]: { ...(adExperiment[category] as object || {}), [name]: value },
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
          .from('ad_creations')
          .update(adExperiment)
          .eq('id', adExperiment.id)
          .select()
          .single()
      : await supabase
          .from('ad_creations')
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
    adExperiment: AdCreationInsert;
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

  const [outlines, setOutlines] = useState<OutlineWithDetails[]>([]);
  const [isLoadingOutlines, setIsLoadingOutlines] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOutlines() {
      setIsLoadingOutlines(true);
      const response = await fetch('/api/create/outlines/get-all-outlines');
      const data = await response.json();
      
      const outlinesWithDetails = await Promise.all(data.outlines.map(async (outline: Outline) => {
        const elementsResponse = await fetch(`/api/create/outlines/get-elements?outline_id=${outline.id}`);
        const elementsData = await elementsResponse.json();
        const elementCount = elementsData.length;
        const totalDuration = calculateOutlineDuration(elementsData);
        return { ...outline, elementCount, totalDuration };
      }));

      setOutlines(outlinesWithDetails);
      setIsLoadingOutlines(false);
    }
    fetchOutlines();
  }, []);

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-[1500px] mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                {isCreatingExperiment
                  ? adExperiment.id
                    ? `${adExperiment.title}`
                    : 'Create New Ad Experiment'
                  : 'Would you like to start creating your ad experiment?'}
              </h1>
              
              {mode === "social-media" ? (
                !isCreatingExperiment ? (
                  <Button onClick={createEmptyAdExperiment}>
                    <Lightbulb className="mr-2 h-4 w-4" /> Create New Ad Experiment
                  </Button>
                ) : (
                  <Button variant="ghost" className="text-gray-600" onClick={() => setIsCreatingExperiment(false)}>
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back to Experiments
                  </Button>
                )
              ) : (
                <OutlineCreator />
              )}
            </div>
          </header>

          <Tabs className="w-full" value={mode} onValueChange={(value) => setMode(value as 'social-media' | 'television')}>
          <TabsList className="inline-flex h-14 items-center w-full space-x-1">
            <TabsTrigger value="social-media" className={`w-full bg-white rounded-t-md rounded-b-none ${mode === 'social-media' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
              <Network className="h-4 w-4 mr-2" />
              Social Media & Short Form
            </TabsTrigger>
            <TabsTrigger value="television" className={`w-full bg-white rounded-t-md rounded-b-none ${mode === 'television' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
              <Video className="h-4 w-4 mr-2" />
              Standard Video & Television
            </TabsTrigger>
          </TabsList>
          <TabsContent value="social-media">
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
                  error={adSuggestionsError}
                />
              </div>
              <AdDraftList
                adDrafts={adDrafts}
                getPoliticalLeaningColor={getPoliticalLeaningColor}
                getStatusColor={getStatusColor}
                loadAdExperiment={loadAdExperiment}
              />
            </div>
          )}
          </TabsContent>
          <TabsContent value="television">
            <Tabs defaultValue="outlines" className="w-full">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-gray-100 p-1 mb-4">
                  <TabsTrigger 
                    value="outlines" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Outlines
                  </TabsTrigger>
                  <TabsTrigger 
                    value="clip-search" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Clip Search
                  </TabsTrigger>
                </TabsList>
              <TabsContent value="outlines">
                <OutlineList initialOutlines={outlines} loading={isLoadingOutlines} />
              </TabsContent>
              <TabsContent value="clip-search">
                <ClipSearchComponent />
              </TabsContent>
            </Tabs>
          </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}