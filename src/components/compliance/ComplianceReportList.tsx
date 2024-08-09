'use client';

import { useState, useEffect } from 'react';
import { ComplianceReportCard } from '@/components/compliance/ComplianceReportCard';
import { Database } from '@/lib/types/schema';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/lib/supabaseClient';

type Outline = Database['public']['Tables']['outline']['Row'];

export default function ComplianceReportList() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchComplianceReports() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('outline')
          .select('*')
          .not('compliance_report', 'is', null);

        if (error) {
          throw error;
        }

        setOutlines(data);
      } catch (error) {
        console.error('Error fetching compliance reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchComplianceReports();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {loading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))
      ) : outlines.length === 0 ? (
        <div className="col-span-full">
          <Card className="p-4 h-full">
            <CardContent className="flex items-center justify-center h-full py-3">
              <p className="text-base text-gray-500">No compliance reports generated yet.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        outlines.map((outline) => (
          <Link href={`/compliance/${outline.id}`} key={outline.id}>
            <ComplianceReportCard 
              outline={outline}
              onDelete={() => setOutlines(outlines.filter(r => r.id !== outline.id))}
            />
          </Link>
        ))
      )}
    </div>
  );
}