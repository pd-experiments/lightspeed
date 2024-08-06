"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Layers } from 'lucide-react';
import { formatDuration, calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Spinner } from '@/components/ui/Spinner';

export default function ScriptPage({ params, searchParams }: { params: { id: string }, searchParams: { title: string } }) {
  const outlineId = params?.id as string;
  const outlineTitle = searchParams?.title || 'Untitled Outline';
  const [fullScript, setFullScript] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [elementCount, setElementCount] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [outline, setOutline] = useState<any>(null);
  const [scriptGenerationProgress, setScriptGenerationProgress] = useState<number>(0);

  useEffect(() => {
    async function fetchOutlineData() {
      setLoading(true);
      try {
        const { data: outlineData, error: outlineError } = await supabase
          .from('outline')
          .select('*')
          .eq('id', outlineId)
          .single();
  
        if (outlineError) throw outlineError;
  
        setFullScript(outlineData.full_script || '');
  
        const { data: elementsData, error: elementsError } = await supabase
          .from('outline_elements')
          .select('*')
          .eq('outline_id', outlineId);
  
        if (elementsError) throw elementsError;
  
        setElementCount(elementsData.length);
        setTotalDuration(calculateOutlineDuration(elementsData));
        setOutline(outlineData);

        setScriptGenerationProgress(outlineData.script_generation_progress);
      } catch (error) {
        console.error('Error fetching outline data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOutlineData();
  }, [outlineId]);

  const handleGenerateFullScript = async () => {
    try {
      setScriptGenerationProgress(1);
      const response = await fetch('/api/outlines/generate-full-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline_id: outlineId }),
      });
      const data = await response.json();
      setFullScript(data.fullScript);
      alert('Full script generated successfully!');
    } catch (error) {
      console.error('Error generating full script:', error);
      alert('Failed to generate full script. Please try again.');
    } finally {
      setScriptGenerationProgress(0);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <Button variant="link" className="mb-4 p-0 h-auto font-normal">
            <Link href={`/outline/${outlineId}`} className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Outline</span>
            </Link>
          </Button>
          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-bold mr-4">Full Script: {outlineTitle}</h1>
            <div className="flex space-x-2">
                <Badge variant="secondary" className="flex items-center">
                <Layers className="w-4 h-4 mr-1" />
                <span>{elementCount} Elements</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDuration(totalDuration)}</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Updated: {outline ? new Date(outline.updated_at).toLocaleDateString() : ''}</span>
                </Badge>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleGenerateFullScript} 
            className="mb-4"
            disabled={scriptGenerationProgress > 0 && scriptGenerationProgress < 100}
          >
            {/* {scriptGenerationProgress > 0 ? (
                scriptGenerationProgress < 100 ? (
                <div className="flex items-center justify-center">
                    <CircularProgressbar
                    value={scriptGenerationProgress}
                    text={`${scriptGenerationProgress}%`}
                    styles={{
                        root: { width: '24px', height: '24px', marginRight: '8px' },
                        path: { stroke: 'currentColor' },
                        text: { fill: 'currentColor', fontSize: '24px' },
                    }}
                    />
                    <span className="text-blue-500">Generating...</span>
                </div>
                ) : (
                <span className="text-blue-500">Regenerate Full Script</span>
                )
            ) : (
                'Generate Full Script'
            )} */}
            {scriptGenerationProgress > 0 ? (
                <div className="flex items-center justify-center">
                <Spinner className="mr-2 h-4 w-4" />
                <span className="text-blue-500">Generating...</span>
                </div>
            ) : (
                scriptGenerationProgress === 100 ? <span className="text-blue-500">Regenerate Full Script</span> : <span className="text-blue-500">Generate Full Script</span>
            )}
          </Button>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="whitespace-pre-wrap">{fullScript}</pre>
          )}
        </div>
      </main>
    </>
  );
}