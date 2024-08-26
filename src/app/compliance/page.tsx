"use client";

import { Suspense, useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Skeleton } from "@/components/ui/skeleton";
import ComplianceReportList from '@/components/create/compliance/ComplianceReportList';
import ComplianceDocList from '@/components/create/compliance/ComplianceDocList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/pageHeader";
import { ComplianceUploadDialog } from '@/components/create/compliance/UploadDialog';
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function ComplianceReports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('docs');
  const [open, setOpen] = useState(false);
  const [loadingItem, setLoadingItem] = useState<{ type: 'url' | 'pdf', value: string } | null>(null);
  const [dots, setDots] = useState<string>('');

  useEffect(() => {
    if (loadingItem) {
      const interval = setInterval(() => {
        setDots((prevDots) => (prevDots.length >= 3 ? '' : prevDots + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loadingItem]);

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="w-full max-w-[1500px]">
          <PageHeader
            text="Compliance Management"
            rightItem={
              activeTab === 'docs' ? (
                <ComplianceUploadDialog 
                  onUpload={(value, isPdf, fileName) => {
                    setLoadingItem(isPdf ? { type: 'pdf', value: fileName || '' } : { type: 'url', value });
                    setOpen(false);
                  }}
                  open={open}
                  setOpen={setOpen}
                />
              ) : (
                <Button size="sm" onClick={() => router.push("/create/ideation")}><PencilLine className="w-4 h-4 mr-2" />Start a Creation</Button>
              )
            }
          />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-gray-100 p-1 mb-4">
                <TabsTrigger 
                  value="docs" 
                  className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Reference Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Generated Reports
                </TabsTrigger>
              </TabsList>
          <TabsContent value="reports">
            <Suspense fallback={<ComplianceReportsSkeleton />}>
              <ComplianceReportList />
            </Suspense>
          </TabsContent>
          <TabsContent value="docs">
            <ComplianceDocList loadingItem={loadingItem} dots={dots} />
          </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}

function ComplianceReportsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} className="h-48 w-full" />
      ))}
    </div>
  );
}