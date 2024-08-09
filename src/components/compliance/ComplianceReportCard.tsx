import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/lib/types/schema';
import { Calendar, Trash2, FileText, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/types/schema';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Outline = Database['public']['Tables']['outline']['Row'];
type ComplianceDoc = Database['public']['Tables']['compliance_docs']['Row'];

interface ComplianceReportCardProps {
  outline: Outline;
  onDelete: () => void;
}

export function ComplianceReportCard({ outline, onDelete }: ComplianceReportCardProps) {
  const router = useRouter();
  const [complianceDoc, setComplianceDoc] = useState<ComplianceDoc>();
  const parsedReport = typeof outline.compliance_report === 'string' ? JSON.parse(outline.compliance_report) : outline.compliance_report;
  
  if (!parsedReport || typeof parsedReport !== 'object') {
    throw new Error('Invalid report format');
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this compliance report?')) {
      try {
        const response = await fetch(`/api/compliance/delete-report?id=${outline.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onDelete();
        } else {
          throw new Error('Failed to delete compliance report');
        }
      } catch (error) {
        console.error('Error deleting compliance report:', error);
        alert('Failed to delete compliance report. Please try again.');
      }
    }
  };

  useEffect(() => {
    async function fetchComplianceDocTitle() {
      if (outline.compliance_doc) {
        const { data, error } = await supabase
          .from('compliance_docs')
          .select('*')
          .eq('id', outline.compliance_doc)
          .single();

        if (error) {
          console.error('Error fetching compliance doc title:', error);
        } else if (data) {
          setComplianceDoc(data);
        }
      }
    }

    fetchComplianceDocTitle();
  }, [outline.compliance_doc]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-xl font-bold text-gray-800">{outline.title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{outline.description}</p>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <FileText className="w-4 h-4 mr-2 text-purple-500" />
            <span className="font-bold">{complianceDoc?.title}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span>Generated: {new Date(outline.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-500" />
            <span>Compliance Status: {parsedReport.overallAssessment ? 'Completed' : 'Pending'}</span>
          </div>
        </div>
        <Button 
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/outline/${outline.id}`);
          }}
          className="mt-3 w-full"
        >
          View Outline
        </Button>
      </CardContent>
    </Card>
  );
}