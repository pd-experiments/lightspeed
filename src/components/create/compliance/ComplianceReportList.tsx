'use client';

import { useState, useEffect } from 'react';
import { ComplianceReportCard } from '@/components/create/compliance/ComplianceReportCard';
import { Database } from '@/lib/types/schema';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/lib/supabaseClient';
import _ from 'lodash';
import { z } from 'zod';
import Link from 'next/link';

type Outline = Database['public']['Tables']['outline']['Row'];
type ComplianceDoc = Database['public']['Tables']['compliance_docs']['Row'];

interface OutlineWithDoc extends Outline {
  compliance_doc_details: ComplianceDoc | null;
}

export default function ComplianceReportList() {
  const [outlines, setOutlines] = useState<OutlineWithDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchComplianceReports() {
      setLoading(true);
      try {
        const { data: outlineData, error: outlineError } = await supabase
          .from('outline')
          .select('*, compliance_doc')
          .not('compliance_report', 'is', null);

        if (outlineError) throw outlineError;

        const outlinesWithDocs = await Promise.all(outlineData.map(async (outline) => {
          if (outline.compliance_doc) {
            const { data: docData, error: docError } = await supabase
              .from('compliance_docs')
              .select('*')
              .eq('id', outline.compliance_doc)
              .single();

            if (docError) throw docError;

            return { ...outline, compliance_doc_details: docData };
          }
          return { ...outline, compliance_doc_details: null };
        }));

        setOutlines(outlinesWithDocs);
      } catch (error) {
        console.error('Error fetching compliance reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchComplianceReports();
  }, []);

  const DocTypeSchema = z.enum(['FEDERAL', 'STATE', 'LOCAL']);
  type DocType = z.infer<typeof DocTypeSchema>;
  
  const docTypes: DocType[] = ['FEDERAL', 'STATE', 'LOCAL'];
  
  const colorMap = {
    'FEDERAL': 'bg-blue-500',
    'STATE': 'bg-green-500',
    'LOCAL': 'bg-yellow-500'
  };
  
  const groupedOutlines = docTypes.reduce((acc, type) => {
    acc[type] = outlines.filter(outline => outline.compliance_doc_details?.type === type);
    return acc;
  }, {} as Record<DocType, OutlineWithDoc[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 rounded-md p-3 px-5 min-h-[500px] max-h-[500px] overflow-y-auto">
      {loading ? (
        docTypes.map((type, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${colorMap[type]}`}></div>
              <h2 className="text-sm font-medium text-gray-700">{type}</h2>
            </div>
            {Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ))
      ) : (
        docTypes.map((type) => (
          <div key={type} className="space-y-4">
            <div className="flex items-center space-x-2 p-2 pb-4">
              <div className={`w-2 h-2 rounded-full ${colorMap[type]}`}></div>
              <h2 className="text-sm font-medium text-gray-700">{type}</h2>
            </div>
            {groupedOutlines[type]?.length > 0 ? (
              groupedOutlines[type].map((outline) => (
                <Link key={outline.id} href={`/compliance/${outline.id}`}> 
                  <ComplianceReportCard 
                    outline={outline}
                    onDelete={() => setOutlines(outlines.filter(r => r.id !== outline.id))}
                  />
                </Link>
              ))
            ) : (
              <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-md">
                <p className="text-sm text-gray-400">No reports</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}