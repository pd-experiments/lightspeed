"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ScriptPage({ params, searchParams }: { params: { id: string }, searchParams: { title: string } }) {
  const outlineId = params?.id as string;
  const outlineTitle = searchParams?.title || 'Untitled Outline';
  const [fullScript, setFullScript] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFullScript() {
        try {
          const { data, error } = await supabase
            .from('outline')
            .select('full_script')
            .eq('id', outlineId)
            .single();
      
          if (error) throw error;
      
          setFullScript(data.full_script || '');
        } catch (error) {
          console.error('Error fetching full script:', error);
        } finally {
          setLoading(false);
        }
      }
    fetchFullScript();
  }, [outlineId]);

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
          <h1 className="text-3xl font-bold mb-6">Full Script: {outlineTitle}</h1>
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