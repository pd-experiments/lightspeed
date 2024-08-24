import { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import { Skeleton } from "@/components/ui/skeleton";
import { OutlineCreator } from '@/components/create/outline/OutlineCreator';
import OutlineList from '@/components/create/outline/OutlineList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Lists() {
  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <Tabs>
            <TabsList>
              <TabsTrigger value="outlines">Outlines</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            <TabsContent value="outlines">
              <h1 className="text-3xl font-bold mb-6">Outlines</h1>
              <p className="text-base text-gray-700 mb-6">Create and manage outlines for your political video productions with simple AI workflows.</p>
              <OutlineCreator />
              <Suspense fallback={<OutlinesSkeleton />}>
                <OutlineList />
              </Suspense>
            </TabsContent>
            <TabsContent value="compliance">  
              
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}

function OutlinesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} className="h-48 w-full" />
      ))}
    </div>
  );
}