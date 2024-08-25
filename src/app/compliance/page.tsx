"use client";

import { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Skeleton } from "@/components/ui/skeleton";
import ComplianceReportList from '@/components/create/compliance/ComplianceReportList';
import ComplianceDocList from '@/components/create/compliance/ComplianceDocList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ComplianceReports() {
  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-[1500px]">
          <h1 className="text-3xl font-bold mb-6">Compliance Management</h1>
          <p className="text-base text-gray-700 mb-6">View and manage compliance documents and generated reports for political video productions.</p>
          <Tabs defaultValue="docs" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="docs">Reference Documents</TabsTrigger>
              <TabsTrigger value="reports">Generated Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="reports">
              <Suspense fallback={<ComplianceReportsSkeleton />}>
                <ComplianceReportList />
              </Suspense>
            </TabsContent>
            <TabsContent value="docs">
              <ComplianceDocList />
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