"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdCreation } from '@/lib/types/customTypes';
import { useRouter } from 'next/navigation';

export default function ExperimentPage({ params }: { params: { id: string } }) {
  const [experiment, setExperiment] = useState<AdCreation | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExperiment();
  }, []);

  const fetchExperiment = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching experiment:', error);
    } else {
      setExperiment(data);
      // Redirect to the appropriate route based on the experiment's flow
      router.push(`/create/testing/${params.id}/${data.flow === "Generation" ? 'generate-versions' : 'build-tests'}`);
    }
  };

  if (!experiment) {
    return <div>Loading...</div>;
  }

  return null;
}