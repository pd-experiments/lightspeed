import { useState } from 'react';
import { AdCreation } from '@/lib/types/customTypes';
import AdTestBuilder from '@/components/create/testing/AdTestBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestingDashboardProps {
  experiment: AdCreation;
}

export default function TestingDashboard({ experiment }: TestingDashboardProps) {
  const [activeTab, setActiveTab] = useState('run-test');

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Ad Testing Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <AdTestBuilder experiment={experiment} />
      </CardContent>
    </Card>
  );
}