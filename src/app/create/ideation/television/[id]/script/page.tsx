"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, PencilIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Layers } from 'lucide-react';
import { formatDuration, calculateOutlineDuration } from '@/lib/helperUtils/outline/utils';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Spinner } from '@/components/ui/Spinner';
import { FaYoutube } from 'react-icons/fa';
import { Mic, Eye, Type, Music, Film, MonitorCheck, Download, FileText, ChevronDown} from 'lucide-react';
import _ from 'lodash';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function ScriptPage({ params, searchParams }: { params: { id: string }, searchParams: { title: string } }) {
  const outlineId = params?.id as string;
  const [outlineTitle, setOutlineTitle] = useState<string>(searchParams?.title || 'Untitled Outline');

  useEffect(() => {
    async function fetchOutlineTitle() {
      if (!searchParams?.title) {
        const { data, error } = await supabase
          .from('outline')
          .select('title')
          .eq('id', outlineId)
          .single();

        if (error) {
          console.error('Error fetching outline title:', error);
        } else if (data) {
          setOutlineTitle(data.title || 'Untitled Outline');
        }
      }
    }

    fetchOutlineTitle();
  }, [outlineId, searchParams?.title]);

  const [fullScript, setFullScript] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [elementCount, setElementCount] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [outline, setOutline] = useState<any>(null);
  const [scriptGenerationProgress, setScriptGenerationProgress] = useState<number>(0);
  const [videoInfo, setVideoInfo] = useState<Record<string, { title: string, id: string, video_id: string }>>({});

  const [complianceReport, setComplianceReport] = useState<string>('');
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [complianceDocTitle, setComplianceDocTitle] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchVideoInfo = async (ids: string[]) => {
    const { data, error } = await supabase
      .from('youtube')
      .select('id, title, video_id')
      .in('id', ids);
  
    if (error) {
      console.error('Error fetching video info:', error);
      return;
    }
  
    const newVideoInfo: Record<string, { title: string, id: string, video_id: string }> = {};
    data.forEach(item => {
      newVideoInfo[item.id] = { title: item.title || '', id: item.id, video_id: item.video_id || '' };
    });
    setVideoInfo(newVideoInfo);
  };

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

        if (outlineData.compliance_doc) {
          const response = await supabase.from('compliance_docs').select('title').eq('id', outlineData.compliance_doc).single();
          setComplianceDocTitle(response.data?.title || 'Unknown');
        }

        setFullScript(outlineData.full_script);
        setComplianceReport(outlineData.compliance_report);
  
        const { data: elementsData, error: elementsError } = await supabase
          .from('outline_elements')
          .select('*')
          .eq('outline_id', outlineId);
  
        console.log("elementsError", elementsError);

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

  useEffect(() => {
    if (fullScript.length > 0) {
      const videoIds = fullScript.filter(item => item.id).map(item => item.id);
      if (videoIds.length > 0) {
        console.log("Fetching video info for", videoIds);
        fetchVideoInfo(videoIds);
      }
    }
  }, [fullScript]);

  const handleGenerateFullScript = async () => {
    try {
      setScriptGenerationProgress(1);
      const response = await fetch('/api/create/outlines/generate-full-script', {
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

  const renderScript = (script: any[]) => {
    return script.map((item, index) => {
      const renderHeader = (icon: React.ReactNode, text: string) => (
        <h2 className="text-sm mb-2 font-semibold text-gray-600 flex items-center">
          {icon}
          <span className="ml-2">{text}</span>
        </h2>
      );
  
      const renderContent = (content: React.ReactNode) => (
        <div key={index} className="mb-4 rounded-md border border-gray-200 p-3 bg-white shadow-sm">
          {content}
        </div>
      );
  
      switch (item.type) {
        case 'NARRATION':
          return (
            <div key={index}>
              {renderHeader(<Mic className="w-4 h-4 text-blue-500" />, 'Speaking Role')}
              {renderContent(
                <p className="text-sm text-gray-800"><strong>{item.speaker}:</strong> {item.content}</p>
              )}
            </div>
          );
        case 'VISUAL':
          return (
            <div key={index}>
              {renderHeader(<Eye className="w-4 h-4 text-green-500" />, 'Visual')}
              {renderContent(
                <p className="text-sm text-green-600">{item.content}</p>
              )}
            </div>
          );
        case 'TRANSITION':
          return (
            <div key={index}>
              {renderHeader(<MonitorCheck className="w-4 h-4 text-purple-500" />, 'Transition')}
              {renderContent(
                <p className="text-sm text-purple-600">{item.content}</p>
              )}
            </div>
          );
        case 'TEXT_OVERLAY':
          return (
            <div key={index}>
              {renderHeader(<Type className="w-4 h-4 text-orange-500" />, 'Text Overlay')}
              {renderContent(
                <p className="text-sm font-medium uppercase text-orange-600">{item.content}</p>
              )}
            </div>
          );
        case 'SOUND_EFFECT':
          return (
            <div key={index}>
              {renderHeader(<Music className="w-4 h-4 text-red-500" />, 'Sound Effect')}
              {renderContent(
                <p className="text-sm font-medium uppercase text-red-600">{item.content}</p>
              )}
            </div>
          );
        case 'EXISTING_SCRIPT':
        case 'SOUNDBITE':
          const info = videoInfo[item.id];
          const startTime = new Date(item.timestamp);
          const endTime = new Date(startTime);
          endTime.setSeconds(startTime.getSeconds() + new Date(item.duration).getSeconds());
          
          const formatTime = (time: Date) => {
            if (!(time instanceof Date) || isNaN(time.getTime())) {
              return 'Invalid Time';
            }
            return time.toISOString().slice(11, 19);
          };
        
          return (
            <div key={index}>
              {renderHeader(<Film className="w-4 h-4 text-indigo-500" />, 'Soundbite')}
              {renderContent(
                <>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="inline-flex items-center py-1 px-2 space-x-2">
                      <Link href={`https://www.youtube.com/watch?v=${info?.video_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <FaYoutube className="mr-1 w-4 h-4 text-red-500" />
                        <span className="text-xs">{info?.title}</span>
                      </Link>
                    </Badge>
                    {item.timestamp && (
                      <p className="text-xs text-indigo-600">
                        <span className="font-bold">Start:</span> {formatTime(startTime)},
                        <span className="font-bold ml-1">End:</span> {formatTime(endTime)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </>
              )}
            </div>
          );
        default:
          return <p key={index} className="text-sm text-gray-700">{item.content}</p>;
      }
    });
  };

  const handleDownloadScript = () => {
    const scriptData = {
      title: outlineTitle,
      id: outlineId,
      elementCount,
      totalDuration,
      updatedAt: outline?.updated_at,
      version: outline?.version,
      script: fullScript
    };

    const jsonString = JSON.stringify(scriptData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${outlineTitle.replace(/\s+/g, '_')}_script.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCheckCompliance = async () => {
    setCheckingCompliance(true);
    try {
      const response = await fetch('/api/create/outlines/script-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline_id: outlineId, compliance_doc_id: outline?.compliance_doc })
      });
      const data = await response.json();
      setComplianceReport(data.complianceReport);
    } catch (error) {
      console.error('Error checking compliance:', error);
    } finally {
      setCheckingCompliance(false);
    }
  };

  const handleDownloadComplianceReport = () => {
    const complianceReportData = {
      title: outlineTitle,
      id: outlineId,
      complianceReport: complianceReport
    };

    const jsonString = JSON.stringify(complianceReportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${outlineTitle.replace(/\s+/g, '_')}_compliance_report.json`;
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
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="w-full max-w-[1500px] mx-auto">
          <Button variant="link" className="p-0 h-auto font-normal">
            <Link href={`/create/ideation/television/${outlineId}`} className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Outline</span>
            </Link>
          </Button>
          <div className="flex items-center mb-6 mt-8">
            <h1 className="text-3xl font-bold mr-4">{_.startCase(outlineTitle)} Script</h1>
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
              <Badge variant="default" className="flex items-center">
                <PencilIcon className="w-4 h-4 mr-1" />
                <span>Version: {outline?.version ?? "1.0"}</span>
              </Badge>
              <Badge variant="default" className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                <span>{complianceDocTitle}</span>
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGenerateFullScript} 
              className="w-full"
              disabled={scriptGenerationProgress > 0 && scriptGenerationProgress < 100}
            >
              {scriptGenerationProgress > 0 && scriptGenerationProgress < 100 ? (
                  <div className="flex items-center justify-center">
                  <Spinner className="mr-2 h-4 w-4" />
                  <span className="text-blue-500">Generating...</span>
                  </div>
              ) : (
                  scriptGenerationProgress === 100 ? <span className="text-blue-500">Regenerate</span> : <span className="text-blue-500">Generate</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDownloadScript}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="my-4 p-4 bg-white border border-gray-200 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">Compliance Report</h2>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleCheckCompliance}
                  className="px-2 py-1 text-xs h-auto bg-blue-500 text-white hover:bg-blue-600"
                  disabled={checkingCompliance || !outline?.compliance_doc}
                >
                  {checkingCompliance ? (
                    <Spinner className="h-3 w-3" />
                  ) : (
                    <span>{complianceReport ? 'Recheck Compliance' : 'Check Compliance'}</span>
                  )}
                </Button>
                {complianceReport && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadComplianceReport}
                    className="px-2 py-1 text-xs h-auto"
                    disabled={checkingCompliance || !outline?.compliance_doc}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </Button>
                )}
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4 space-y-4">
              {complianceReport && renderComplianceReport(complianceReport)}
            </CollapsibleContent>
          </Collapsible>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="my-4 p-4 bg-white border border-gray-200 rounded-lg shadow">
              <div className="space-y-4">{renderScript(fullScript)}</div>
            </div>
          )}
        </div>
      </main>
    </Navbar>
  );
}