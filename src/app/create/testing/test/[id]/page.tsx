"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beaker, Clock, FileText, ArrowLeft, ChevronRight, ChevronLeft, Tag } from 'lucide-react';
import { Calendar, Globe, Target, Users, DollarSign, BarChart2, Zap } from 'lucide-react';
import _ from 'lodash';
import Link from 'next/link';

type AdTest = Database['public']['Tables']['ad_tests']['Row'];

export default function TestDetailsPage() {
  const [test, setTest] = useState<AdTest | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchTestDetails();
  }, []);

  const fetchTestDetails = async () => {
    const { data, error } = await supabase
      .from('ad_tests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching test details:', error);
    } else {
      setTest(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Created': 'bg-orange-100 text-orange-800',
      'Configured': 'bg-blue-100 text-blue-800',
      'Running': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!test) {
    return <div>Test not found</div>;
  }

  const getIconForKey = (key: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      budget: <DollarSign className="w-5 h-5 text-green-500" />,
      target_audience: <Users className="w-5 h-5 text-purple-500" />,
      objective: <Target className="w-5 h-5 text-red-500" />,
      duration: <Calendar className="w-5 h-5 text-orange-500" />,
      metrics: <BarChart2 className="w-5 h-5 text-blue-500" />,
    };
    return iconMap[key] || <Zap className="w-5 h-5 text-gray-500" />;
  };

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-gray-200">
              <div>
                <div className="flex items-center mb-4 sm:mb-0">
                  <h1 className="text-2xl font-medium text-gray-900 mr-3">
                    Let&apos;s see how Test #{test.id.slice(0, 8)} is doing!
                  </h1>
                  <Badge className={`${getStatusColor(test.status)} text-sm font-medium px-3 py-1`}>
                    {test.status}
                  </Badge>
                </div>
              </div>
              <Link href="/create/testing" className="mt-4 sm:mt-0">
                <Button variant="ghost" className="text-gray-600">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back to Tests
                </Button>
              </Link>
            </div>
          </header>

          <div className="space-y-8">
            <Card className="bg-white shadow-sm flex flex-col h-full space-y-3">
              <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
                  <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                  Test Overview
                  </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-blue-500">
                  <CardContent className="flex items-center p-4">
                    <Clock className="w-8 h-8 mr-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-lg font-semibold text-gray-900">{new Date(test.created_at || '').toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-purple-500">
                  <CardContent className="flex items-center p-4">
                    <Globe className="w-8 h-8 mr-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Platform</p>
                      <p className="text-lg font-semibold text-gray-900">{test.platform}</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm flex flex-col h-full space-y-3">
              <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
                  <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                  Test Configuration
                  </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(test).map(([key, value]) => {
                  if (['id', 'created_at', 'updated_at', 'experiment_id', 'status', 'platform'].includes(key)) return null;
                  return (
                    <Card key={key} className="border-l-4 border-gray-300 hover:border-blue-500 transition-colors duration-300">
                      <CardContent className="flex items-start p-4">
                        {getIconForKey(key)}
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{_.startCase(key)}</p>
                          <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="flex items-center bg-blue-500 hover:bg-blue-600 text-white">
                {test.status === 'Created' ? 'Deploy Test' : test.status === 'Running' ? 'View Progress' : 'View Results'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </Navbar>
  );
}