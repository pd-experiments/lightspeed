"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beaker, Clock, FileText, ArrowLeft, ChevronRight, ChevronLeft, Tag, Building2, CirclePlayIcon, CircleStopIcon } from 'lucide-react';
import { Calendar, Globe, Target, Users, DollarSign, BarChart2, Zap } from 'lucide-react';
import _ from 'lodash';
import Link from 'next/link';
import { AdTest } from '@/lib/types/customTypes';
import axios from 'axios';
import { toast } from "sonner"

export default function TestDetailsPage() {
  const [test, setTest] = useState<AdTest | null>(null);
  const [loadingTestDetails, setLoadingTestDetails] = useState(true);
  const [loadingDeployTest, setLoadingDeployTest] = useState(false);
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTest, setEditedTest] = useState<AdTest | null>(null);

  useEffect(() => {
    fetchTestDetails();
  }, []);

  const fetchTestDetails = async () => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .select('*')
      .eq('type', 'Test')
      .eq('id', params?.id)
      .single();
  
    if (error) {
      console.error('Error fetching test details:', error);
    } else {
      setTest(data);
      setEditedTest(data);
    }
    setLoadingTestDetails(false);
  };

  const saveEditedTest = async () => {
    if (!editedTest) return;
  
    try {
      const { data, error } = await supabase
        .from('ad_deployments')
        .update(editedTest)
        .eq('id', editedTest.id);
  
      if (error) throw error;
  
      setTest(editedTest);
      setIsEditing(false);
      toast.success('Test updated successfully');
    } catch (error) {
      toast.error(`Failed to update test: ${String(error)}`);
    }
  };

  const deployTest = async () => {
    try {
      setLoadingDeployTest(true);
      const platform = test?.platform.toLowerCase().replace(' ', '-');
      const encodedPlatform = encodeURIComponent(platform || '');
      const response = await axios.post(`/api/create/testing/deploy-${encodedPlatform}-test`, {
        deploymentId: test?.id
      });
  
      if (response.data.success) {
        toast.success(`${test?.platform} test deployed successfully`);
        await fetchTestDetails();
      } else {
        throw new Error(response.data.error || 'Failed to deploy test');
      }
    } catch (error) {
      toast.error(`Failed to deploy ${test?.platform} test: ${String(error)}`);
    } finally {
      setLoadingDeployTest(false);
    }
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
        <div className="max-w-[1500px] mx-auto p-4">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-gray-200">
              <div>
                <div className="flex items-center mb-4 sm:mb-0">
                  <h1 className="text-2xl font-medium text-gray-900 mr-3">
                    Let&apos;s see how Test #{test?.id.slice(0, 8)} is doing!
                  </h1>
                  <Badge className={`${getStatusColor(test?.status || '')} text-sm font-medium px-3 py-1`}>
                    {test?.status}
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
              <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Beaker className="w-5 h-5 text-orange-500" />
                    <CardTitle className="text-xl font-semibold text-gray-800">
                      Test Overview
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-blue-500">
                  <CardContent className="flex items-center p-4">
                    <Clock className="w-8 h-8 mr-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-lg font-semibold text-gray-900">{new Date(test?.created_at || '').toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-purple-500">
                  <CardContent className="flex items-center p-4">
                    <Globe className="w-8 h-8 mr-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Platform</p>
                      <p className="text-lg font-semibold text-gray-900">{test?.platform}</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm flex flex-col h-full space-y-3">
              <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-xl font-semibold text-gray-800">
                      Test Configuration
                    </CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    {!isEditing && test && test.status === 'Created' && (
                      <Button 
                        onClick={deployTest}
                        disabled={loadingDeployTest}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                      >
                        {loadingDeployTest ? (
                          'Deploying...'
                        ) : (
                          <>
                            <CirclePlayIcon className="w-4 h-4 mr-2" />
                            Deploy Test
                          </>
                        )}
                      </Button>
                    )}
                    {!isEditing && test && test.status === 'Running' && (
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
                        <CircleStopIcon className="w-4 h-4 mr-2" />
                        Pause Test
                      </Button>
                    )}
                    {!isEditing && test && test.status === 'Paused' && (
                      <Button className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
                        <CirclePlayIcon className="w-4 h-4 mr-2" />
                        Redeploy Test
                      </Button>
                    )}
                    {isEditing ? (
                      <Button onClick={saveEditedTest} className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
                        Save Changes
                      </Button>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editedTest && Object.entries(editedTest).map(([key, value]) => {
                  if (['id', 'created_at', 'updated_at', 'experiment_id', 'status', 'platform'].includes(key)) return null;
                  const isEditable = !['version_id', 'type'].includes(key);
                  return (
                    <Card key={key} className="border-l-4 border-gray-300 hover:border-blue-500 transition-colors duration-300">
                      <CardContent className="flex items-start p-4">
                        {getIconForKey(key)}
                        <div className="ml-4 w-full">
                          <p className="text-sm font-medium text-gray-500">{_.startCase(key)}</p>
                          {isEditing && isEditable ? (
                            <input
                              type="text"
                              value={String(value)}
                              onChange={(e) => setEditedTest({...editedTest, [key]: e.target.value})}
                              className="text-lg font-semibold text-gray-900 w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Navbar>
  );
}