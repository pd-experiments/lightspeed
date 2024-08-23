import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/lib/types/schema';
import { Calendar, Trash2, FileText, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type Outline = Database['public']['Tables']['outline']['Row'];
type ComplianceDoc = Database['public']['Tables']['compliance_docs']['Row'];

interface OutlineWithDoc extends Outline {
  compliance_doc_details: ComplianceDoc | null;
}

interface ComplianceReportCardProps {
  outline: OutlineWithDoc;
  onDelete: () => void;
}

export function ComplianceReportCard({ outline, onDelete }: ComplianceReportCardProps) {
  const router = useRouter();
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

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold line-clamp-1">{outline.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{outline.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          <div className="flex items-center">
            <FileText className="w-3 h-3 mr-1 text-purple-500" />
            <span className="font-bold line-clamp-1">{outline.compliance_doc_details?.title}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-green-500" />
            <span>{new Date(outline.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-3 h-3 mr-1 text-blue-500" />
            <span>{parsedReport.overallAssessment ? 'Completed' : 'Pending'}</span>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className="mt-2 shadow-md hover:shadow-lg cursor-pointer text-xs w-full justify-center"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/outline/${outline.id}`);
          }}
        >
          View Outline
        </Badge>
      </CardContent>
    </Card>
  );
}