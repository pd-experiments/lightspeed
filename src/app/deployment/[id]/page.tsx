"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Clock, FileText, ArrowLeft, ChevronRight, ChevronLeft, Tag, Building2, CirclePlayIcon, CircleStopIcon, BookOpenText, Rabbit, UsersIcon, CloudSun } from 'lucide-react';
import { Calendar, Globe, Target, Users, DollarSign, BarChart2, Zap, Eye, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import _ from 'lodash';
import Link from 'next/link';
import { AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { toast } from "sonner"
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from '@/components/ui/pageHeader';

export default function DeploymentDetailsPage() {
  const [deployment, setDeployment] = useState<AdDeploymentWithCreation | null>(null);
  const [loadingDeploymentDetails, setLoadingDeploymentDetails] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeployment, setEditedDeployment] = useState<AdDeploymentWithCreation | null>(null);
  const [loadingDeployAction, setLoadingDeployAction] = useState(false);

  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchDeploymentDetails();
  }, []);

  const fetchDeploymentDetails = async () => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .select(`
        *,
        creation:ad_creations(*)
      `)
      .eq('type', 'Standard')
      .eq('id', params?.id)
      .single();
  
    if (error) {
      console.error('Error fetching deployment details:', error);
    } else {
      setDeployment(data);
      setEditedDeployment(data);
    }
    setLoadingDeploymentDetails(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-green-100 text-green-800',
      'Deployed': 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const saveEditedDeployment = async () => {
    if (!editedDeployment) return;
  
    try {
      const { creation, ...deploymentDataToUpdate } = editedDeployment;
      const { data, error } = await supabase
        .from('ad_deployments')
        .update(deploymentDataToUpdate)
        .eq('id', editedDeployment.id);
  
      if (error) throw error;
  
      setDeployment(editedDeployment);
      setIsEditing(false);
      toast.success('Deployment updated successfully');
    } catch (error) {
      toast.error(`Failed to update deployment: ${String(error)}`);
    }
  };
  
  const handleDeploymentAction = async (action: 'deploy' | 'pause' | 'redeploy') => {
    try {
      setLoadingDeployAction(true);
      const platform = deployment?.creation?.platforms[0]?.toLowerCase().replace(' ', '-');
      const encodedPlatform = encodeURIComponent(platform || '');
      const response = await axios.post(`/api/create/deployment/${action}-${encodedPlatform}`, {
        deploymentId: deployment?.id
      });
  
      if (response.data.success) {
        toast.success(`${deployment?.creation?.platforms[0]} deployment ${action}ed successfully`);
        await fetchDeploymentDetails();
      } else {
        throw new Error(response.data.error || `Failed to ${action} deployment`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} ${deployment?.creation?.platforms[0]} deployment: ${String(error)}`);
    } finally {
      setLoadingDeployAction(false);
    }
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
          <PageHeader
            text={`Let's see how "${deployment?.creation?.title}" is doing!`}
            icons={[
              <Badge key="status" className={`${getStatusColor(deployment?.status || '')} text-sm font-medium px-3 py-1`}>
                {deployment?.status}
              </Badge>
            ]}
            rightItem={
              <Button variant="ghost" className="text-gray-600" onClick={() => router.push('/deployment')}>
                <ChevronLeft className="mr-2 h-5 w-5" /> Back to Deployments
              </Button>
            }
          />

          <Tabs defaultValue="overview" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="audience">Audience Insights</TabsTrigger>
                <TabsTrigger value="content">Content Analysis</TabsTrigger>
              </TabsList>

              {!isEditing && deployment && (
                <div>
                  {deployment.status === 'Created' && (
                    <Button 
                      onClick={() => handleDeploymentAction('deploy')}
                      disabled={loadingDeployAction}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                    >
                      {loadingDeployAction ? (
                        'Deploying...'
                      ) : (
                        <>
                          <CirclePlayIcon className="w-4 h-4 mr-2" />
                          Deploy
                        </>
                      )}
                    </Button>
                  )}
                  {deployment.status === 'Deployed' && (
                    <Button 
                      onClick={() => handleDeploymentAction('pause')}
                      className="bg-red-400 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                    >
                      <CircleStopIcon className="w-4 h-4 mr-2" />
                      Stop Deployment
                    </Button>
                  )}
                  {deployment.status === 'Running' && (
                    <Button 
                      onClick={() => handleDeploymentAction('pause')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                    >
                      <CircleStopIcon className="w-4 h-4 mr-2" />
                      Pause Deployment
                    </Button>
                  )}
                  {deployment.status === 'Paused' && (
                    <Button 
                      onClick={() => handleDeploymentAction('redeploy')}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                    >
                      <CirclePlayIcon className="w-4 h-4 mr-2" />
                      Redeploy
                    </Button>
                  )}
                </div>
              )}
            </div>

            <TabsContent value="overview">
              <Card>
                <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <BookOpenText className="w-5 h-5 text-blue-500" />
                            <CardTitle className="text-xl font-semibold text-gray-800">
                            Overview
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <Badge className={`${getStatusColor(deployment?.status || '')} w-fit`}>
                        {deployment?.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-500">Platform</span>
                      <span className="text-lg font-semibold">{deployment?.creation?.platforms[0]}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-500">Budget Spent</span>
                      <span className="text-lg font-semibold">${deployment?.budget_spent || 0}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-500">Impressions</span>
                      <span className="text-lg font-semibold">{deployment?.impressions || 0}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-500">Clicks</span>
                      <span className="text-lg font-semibold">{deployment?.clicks || 0}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-500">CTR</span>
                      <span className="text-lg font-semibold">
                        {deployment?.clicks && deployment?.impressions
                          ? ((deployment.clicks / deployment.impressions) * 100).toFixed(2) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration">
              <Card>
                <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-xl font-semibold text-gray-800">
                        Deployment Configuration
                        </CardTitle>
                    </div>
                    <div className="flex space-x-2">
                  {isEditing ? (
                        <Button onClick={saveEditedDeployment} className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
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
                <CardContent>
                  {/* Keep the existing configuration content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {editedDeployment && Object.entries(editedDeployment).map(([key, value]) => {
                      if (['id', 'created_at', 'updated_at', 'experiment_id', 'status', 'creation'].includes(key)) return null;
                      const isEditable = !['type'].includes(key);
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
                                  onChange={(e) => setEditedDeployment({...editedDeployment, [key]: e.target.value})}
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
              <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Rabbit className="w-5 h-5 text-blue-500" />
                            <CardTitle className="text-xl font-semibold text-gray-800">
                            Performance Metrics
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Cost per Click (CPC)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          ${deployment?.budget_spent && deployment?.clicks
                            ? (deployment.budget_spent / deployment.clicks).toFixed(2)
                            : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Click-through Rate (CTR)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {deployment?.clicks && deployment?.impressions
                            ? ((deployment.clicks / deployment.impressions) * 100).toFixed(2) + '%'
                            : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {deployment?.conversions && deployment?.clicks
                            ? ((deployment.conversions / deployment.clicks) * 100).toFixed(2) + '%'
                            : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                    {/* Add more performance metrics cards as needed */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience">
              <Card>
                <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <UsersIcon className="w-5 h-5 text-blue-500" />
                            <CardTitle className="text-xl font-semibold text-gray-800">
                            Audience Insights
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Demographics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Add demographic charts or data here */}
                        <p>Demographic data visualization placeholder</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Interests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Add interest data or charts here */}
                        <p>Interest data visualization placeholder</p>
                      </CardContent>
                    </Card>
                    {/* Add more audience insight cards as needed */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader className="border-b bg-white p-6 rounded-t-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <CloudSun className="w-5 h-5 text-blue-500" />
                            <CardTitle className="text-xl font-semibold text-gray-800">
                            Content Insights + Next Steps
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ad Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Add ad preview component here */}
                        <p>Ad preview placeholder</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Content Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Add content performance metrics or charts here */}
                        <p>Content performance data visualization placeholder</p>
                      </CardContent>
                    </Card>
                    {/* Add more content analysis cards as needed */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}