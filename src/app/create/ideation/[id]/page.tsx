"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Info, DollarSign, Users, FileText, Share, Zap } from 'lucide-react';
import { AdCreationInsert, AdCreation } from '@/lib/types/customTypes';
import BasicInformationStep from '@/components/create/ideation/BasicInformationStep';
import BudgetAndTimelineStep from '@/components/create/ideation/BudgetAndTimelineStep';
import TargetAudienceStep from '@/components/create/ideation/TargetAudienceStep';
import AdContentStep from '@/components/create/ideation/AdContentStep';
import PlatformsAndLeaningStep from '@/components/create/ideation/PlatformsAndLeaningStep';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/pageHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function IdeationStepperPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadAdExperiment(params.id);
  }, [params.id]);

  const loadAdExperiment = async (id: string) => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading ad experiment:', error);
    } else if (data) {
      setAdExperiment(data);
    }
  };

  const updateExperiment = async (field: string, value: any) => {
    if (!adExperiment.id) return;
  
    const updatedExperiment = { ...adExperiment, [field]: value };
    setAdExperiment(updatedExperiment);
  
    const { data, error } = await supabase
      .from('ad_creations')
      .update({ [field]: value })
      .eq('id', adExperiment.id)
      .select()
      .single();
  
    if (error) {
      console.error('Error updating experiment:', error);
    }
  };

  const steps = [
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
        <div className="max-w-[1500px] mx-auto mt-8">
          <PageHeader 
            text={`Let's set up "${adExperiment.title}"!`}
            rightItem={
              <>
              <Button variant="ghost" className="text-gray-600" onClick={() => router.push('/create/ideation')}>
                <ChevronLeft className="mr-2 h-5 w-5" /> Back to Ideation Dashboard
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      key="quickSetup"
                      // onClick={handleQuickSetup}
                      variant="outline"
                      className="w-full flex items-center text-white hover:text-gray-100 shadow-md hover:bg-blue-500 bg-gradient-to-r from-blue-400 to-purple-500"
                    >
                      <Zap className="mr-2 h-4 w-4" /> Try Quick Setup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>0 to 1 your ad creative with just a few questions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              </>
            }
          />


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
                adCreation={adExperiment}
                onUpdate={updateExperiment}
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
      </main>
    </Navbar>
  );
}