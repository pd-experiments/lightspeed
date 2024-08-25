"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Download, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import _ from 'lodash';
import { Database } from "@/lib/types/schema";
import { useRouter } from 'next/navigation';

type Outline = Database['public']['Tables']['outline']['Row'];

export default function ComplianceReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const outlineId = params?.id as string;
  const [report, setReport] = useState<object | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function fetchComplianceReport() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('outline')
          .select('*')
          .eq('id', outlineId)
          .single();

        if (error) throw error;

        setReport(data.compliance_report);
        setOutline(data)
      } catch (error) {
        console.error('Error fetching compliance report:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchComplianceReport();
  }, [outlineId]);

  const handleDownloadComplianceReport = () => {
    const complianceReportData = {
      title: outline?.title,
      id: outlineId,
      complianceReport: report
    };

    const jsonString = JSON.stringify(complianceReportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${outline?.title?.replace(/\s+/g, '_')}_compliance_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  type ComplianceAspect = {
    header: string;
    issue?: string;
    background?: string;
    recommendation?: string;
    reference?: string;
  }

  const renderComplianceReport = (report: string | object) => {
    try {
      const parsedReport = typeof report === 'string' ? JSON.parse(report) : report;
  
      if (!parsedReport || typeof parsedReport !== 'object') {
        throw new Error('Invalid report format');
      }
  
      return (
        <>
          {Array.isArray(parsedReport.aspects) ? (
            parsedReport.aspects.map((aspect: ComplianceAspect, index: number) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                <h3 className="text-base font-semibold text-gray-800">{aspect.header}</h3>
                <div className="mt-2 space-y-2">
                  {aspect.issue && (
                    <div>
                      <span className="font-medium text-gray-700">Issue: </span>
                      <span className="text-gray-600">{aspect.issue}</span>
                    </div>
                  )}
                  {aspect.background && (
                    <div>
                      <span className="font-medium text-gray-700">Background: </span>
                      <span className="text-gray-600">{aspect.background}</span>
                    </div>
                  )}
                  {aspect.recommendation && (
                    <div>
                      <span className="font-medium text-gray-700">Recommendation: </span>
                      <span className="text-gray-600">{aspect.recommendation}</span>
                    </div>
                  )}
                  {aspect.reference && (
                    <div>
                      <span className="font-medium text-gray-700">Reference: </span>
                      <span className="text-gray-600">{aspect.reference}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-yellow-500">No compliance aspects found in the report.</p>
          )}
          {parsedReport.overallAssessment && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-base font-semibold text-blue-800">Overall Compliance Assessment</h3>
              <p className="mt-2 text-blue-700 text-sm">{parsedReport.overallAssessment}</p>
            </div>
          )}
        </>
      );
    } catch (error) {
      console.error('Error parsing compliance report:', error);
      return (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-500">Error parsing compliance report</p>
          <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
            {typeof report === 'string' ? report : JSON.stringify(report, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <Button variant="link" className="mb-4 p-0 h-auto font-normal">
            <Link href="/compliance" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Compliance Reports</span>
            </Link>
          </Button>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <h1 className="text-3xl font-bold mr-4">{_.startCase(outline?.title ?? '')} Compliance Report</h1>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Generated: {new Date(outline?.updated_at ?? '').toLocaleDateString()}</span>
                  </Badge>
                  {/* <Badge variant="default" className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>Status: {report?.overallAssessment ? 'Completed' : 'Pending'}</span>
                  </Badge> */}
                </div>
              </div>
              <div className="flex items-center mb-3 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadComplianceReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  router.push(`/outline/${outline?.id}/script?title=${outline?.title}`)
                }}>
                <Pencil className="mr-2 h-4 w-4" />
                View Associated Script
              </Button>
              </div>
              <div className="my-4 p-4 bg-white border border-gray-200 rounded-lg shadow">
                {report && renderComplianceReport(report)}
              </div>
            </>
          )}
        </div>
      </main>
    </Navbar>
  );
}