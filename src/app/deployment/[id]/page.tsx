"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Clock, FileText, ArrowLeft, ChevronRight, ChevronLeft, Tag, Building2, CirclePlayIcon, CircleStopIcon, BookOpenText, Rabbit, UsersIcon, CloudSun, AlertCircle, Bot } from 'lucide-react';
import { Sparkle, Calendar, Globe, Target, Users, DollarSign, BarChart2, Zap, Eye, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import _ from 'lodash';
import Link from 'next/link';
import { AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { toast } from "sonner"
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from '@/components/ui/pageHeader';
import { FacebookEmbed, InstagramPostEmbed, InstagramStoryEmbed, InstagramReelEmbed, TikTokEmbed, ThreadsEmbed } from '@/components/ui/socialMediaEmbeds';
import { AdVersion, Platform } from '@/lib/types/customTypes';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from  "@/components/ui/input"
import { Label } from  "@/components/ui/label"
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MousePointerClick, TrendingUp } from 'lucide-react';
import { AdPerformanceData, CampaignInfo} from '@/lib/types/customTypes';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DeploymentDetailsPage() {
  const [deployment, setDeployment] = useState<AdDeploymentWithCreation | null>(null);
  const [loadingDeploymentDetails, setLoadingDeploymentDetails] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeployment, setEditedDeployment] = useState<AdDeploymentWithCreation | null>(null);
  const [loadingDeployAction, setLoadingDeployAction] = useState(false);

  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [demographics, setDemographics] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  const [contentInsights, setContentInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const params = useParams();
  const router = useRouter();
  
  const [adSetData, setAdSetData] = useState({
    name: deployment?.adset_name,
    dailyBudget: deployment?.adset_budget,
    billingEvent: 'IMPRESSIONS',
    optimizationGoal: 'LINK_CLICKS',
    bidAmount: '',
    targeting: {
      geo_locations: {
        countries: ['US'],
      },
      age_min: 18,
      age_max: 65,
    },
    id: deployment?.adset_id,
  });

  useEffect(() => {
    fetchDeploymentDetails();
    // fetchMetrics();
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
      setAdSetData({
        id: data.adset_id,
        name: data.adset_name,
        dailyBudget: data.adset_budget,
        billingEvent: 'IMPRESSIONS',
        optimizationGoal: 'LINK_CLICKS',
        bidAmount: '',
        targeting: {
          geo_locations: {
            countries: ['US'],
          },
          age_min: 18,
          age_max: 65,
        },
      });
      setEditedDeployment(data);
    }
    setLoadingDeploymentDetails(false);
  };


  const fetchMetrics = async () => {
    if (!deployment?.id || !deployment?.performance_data) return;
  
    setLoadingMetrics(true);
    try {
      // First, try to fetch existing performance data from Supabase
      const { data: existingData, error: fetchError } = await supabase
        .from('ad_deployments')
        .select('performance_data, updated_at')
        .eq('id', params?.id)
        .single();

      console.log(existingData?.performance_data)
  
      if (fetchError) throw fetchError;
  
      const now = new Date();
      const lastUpdate = existingData?.performance_data.updated_at ? new Date(existingData.performance_data.updated_at) : null;
      const hoursSinceLastUpdate = lastUpdate
        ? (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
        : Infinity;
  
      if (existingData?.performance_data && hoursSinceLastUpdate < 24) {
        // Use existing data if it's less than 24 hours old
        const performanceData: AdPerformanceData = existingData.performance_data;
        setMetrics(performanceData.metrics);
        setDemographics(performanceData.demographics);
        setComments(performanceData.comments);
        setTimeSeriesData(performanceData.timeSeriesData);
        console.log('Using cached performance data');
      } else {
        // Fetch new data if no existing data or it's older than 24 hours
        const response = await axios.get(`/api/create/testing/fetch-facebook-ad-insights?adId=${deployment?.adset_id}`);
        if (response.data.success) {
          const performanceData: AdPerformanceData = {
            updated_at: response.data.updated_at,
            metrics: response.data.metrics,
            demographics: response.data.demographics,
            comments: response.data.comments,
            timeSeriesData: response.data.timeSeriesData
          };
  
          setMetrics(performanceData.metrics);
          setDemographics(performanceData.demographics);
          setComments(performanceData.comments);
          setTimeSeriesData(performanceData.timeSeriesData);
  
          // Store the new performance data in the ad_deployments table
          const { error: updateError } = await supabase
            .from('ad_deployments')
            .update({ performance_data: performanceData, updated_at: new Date().toISOString() })
            .eq('id', deployment?.id);
  
          if (updateError) {
            console.error('Error updating performance data:', updateError);
            toast.error('Failed to update performance data');
          } else {
            toast.success('Performance data updated successfully');
          }
        } else {
          throw new Error(response.data.error || 'Failed to fetch metrics');
        }
      }
    } catch (error) {
      console.error('Error fetching or updating metrics:', error);
      toast.error(`Failed to fetch or update metrics: ${String(error)}`);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchContentInsights = async () => {
    if (!deployment?.id || !deployment?.performance_data) return;

    setLoadingInsights(true);
    try {
      const response = await axios.post('/api/deployment/content-insights', { deploymentId: deployment.id });
      setContentInsights(response.data.insights);
    } catch (error) {
      console.error('Error fetching content insights:', error);
      toast.error('Failed to fetch content insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchContentInsights();
  }, [deployment?.id, deployment?.performance_data]);

  useEffect(() => {
    fetchMetrics();
  }, [deployment?.id, deployment?.adset_id]);

  // useEffect(() => {
  //   if (deployment?.status === 'Deployed' || deployment?.status === 'Running') {
  //     fetchMetrics();
  //     const intervalId = setInterval(fetchMetrics, 24 * 60 * 60 * 1000); 
  //     return () => clearInterval(intervalId);
  //   }
  // }, [deployment?.status, deployment?.adset_id]);

  const prepareChartData = (data: any) => {
    if (!data) return [];
    return Object.entries(data).map(([key, value]: [string, any]) => {
      const [age, gender] = key.split('-');
      return {
        ageGender: `${age} ${gender}`,
        impressions: parseInt(value.impressions),
        clicks: parseInt(value.clicks),
        spend: parseFloat(value.spend)
      };
    });
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
      saveImageUrls();
      setIsEditing(false);
      toast.success('Deployment updated successfully');
    } catch (error) {
      toast.error(`Failed to update deployment: ${String(error)}`);
    }
  };
  
  const handleDeploymentAction = async (action: 'deploy' | 'pause' | 'redeploy') => {
    const newAction = 'deploy';
    try {
      setLoadingDeployAction(true);
      const platform = deployment?.platform?.toLowerCase().replace(' ', '-');
      const encodedPlatform = encodeURIComponent(platform || '');
      const response = await axios.post(`/api/create/deployment/${newAction}-${encodedPlatform}-test`, {
        deploymentId: deployment?.id
      });
  
      if (response.data.success) {
        toast.success(`${deployment?.platform} deployment ${newAction}ed successfully`);
        await fetchDeploymentDetails();
      } else {
        throw new Error(response.data.error || `Failed to ${deployment?.platform} deployment`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} ${deployment?.platform} deployment: ${String(error)}`);
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

  const renderSocialMediaEmbed = () => {
    if (!deployment || !deployment.creation) return null;

    const version: AdVersion | undefined = deployment.creation.version_data.versions.find(v => v.id === deployment.version_id);

    if (!version) return null;

    const imageUrls = deployment.creation.image_urls || [];

    switch (version.platform.toLowerCase() as Lowercase<Platform>) {
      case 'facebook':
        return <FacebookEmbed version={version} imageUrls={imageUrls} />;
      case 'instagram post':
        return <InstagramPostEmbed version={version} imageUrls={imageUrls} />;
      case 'instagram story':
        return <InstagramStoryEmbed version={version} />;
      case 'instagram reel':
        return <InstagramReelEmbed version={version} />;
      case 'tiktok':
        return <TikTokEmbed version={version} />;
      case 'threads':
        return <ThreadsEmbed version={version} imageUrls={imageUrls} />;
      default:
        return null;
    }
  };

  const [requiredFields] = useState<string[]>([
    'budget', 'placement', 'link', 'caption', 'adset_id', 'bid_strategy', 'audience', 'duration', 'type'
  ]);

  const isFormValid = () => {
    if (!editedDeployment) return false;
    return requiredFields.every(field => editedDeployment[field as keyof AdDeploymentWithCreation] !== '');
  };


  const handleImageUrlChange = (index: number, value: string) => {
    if (editedDeployment?.creation) {
      const newImageUrls = [...(editedDeployment.creation.image_urls || [])];
      newImageUrls[index] = value;
      setEditedDeployment({
        ...editedDeployment,
        creation: { ...editedDeployment.creation, image_urls: newImageUrls }
      });
    }
  };
  
  const addImageUrl = () => {
    if (editedDeployment?.creation) {
      setEditedDeployment({
        ...editedDeployment,
        creation: {
          ...editedDeployment.creation,
          image_urls: [...(editedDeployment.creation.image_urls || []), '']
        }
      });
    }
  };
  
  const removeImageUrl = (index: number) => {
    if (editedDeployment?.creation) {
      const newImageUrls = [...(editedDeployment.creation.image_urls || [])];
      newImageUrls.splice(index, 1);
      setEditedDeployment({
        ...editedDeployment,
        creation: { ...editedDeployment.creation, image_urls: newImageUrls }
      });
    }
  };
  
  const saveImageUrls = async () => {
    if (!editedDeployment?.creation) return;
  
    try {
      const { data, error } = await supabase
        .from('ad_creations')
        .update({ image_urls: editedDeployment.creation.image_urls })
        .eq('id', editedDeployment.creation.id);
  
      if (error) throw error;
  
      toast.success('Image URLs updated successfully');
    } catch (error) {
      toast.error(`Failed to update image URLs: ${String(error)}`);
    }
  };

  const [campaignData, setCampaignData] = useState<CampaignInfo>({
    name: '',
    objective: 'OUTCOME_ENGAGEMENT',
    id: '',
  });

  useEffect(() => {
    if (deployment?.campaign_info) {
      setCampaignData(deployment.campaign_info);
    }
  }, [deployment]);

  const createCampaign = async () => {
    try {
      const response = await axios.post('/api/create/testing/create-facebook-campaign', campaignData);
      if (response.data.success) {
        const updatedCampaignInfo: CampaignInfo = {
          ...campaignData,
          id: response.data.campaignId,
        };
        setEditedDeployment(prev => ({
          ...prev!,
          campaign_info: updatedCampaignInfo,
        }));
        setCampaignData(updatedCampaignInfo);
        toast.success('Campaign created successfully');
      } else {
        throw new Error(response.data.error || 'Failed to create campaign');
      }
    } catch (error) {
      toast.error(`Failed to create campaign: ${String(error)}`);
    }
  };

  const createAdSet = async () => {
    if (!editedDeployment?.campaign_info?.id) {
      toast.error('Please create a campaign first');
      return;
    }
    try {
      const response = await axios.post('/api/create/testing/create-facebook-ad-set', {
        ...adSetData,
        campaignId: editedDeployment.campaign_info?.id,
      });
      if (response.data.success) {
        setEditedDeployment(prev => ({ ...prev!, adset_id: response.data.adsetId }));
        toast.success('Ad Set created successfully');
      } else {
        throw new Error(response.data.error || 'Failed to create ad set');
      }
    } catch (error) {
      toast.error(`Failed to create ad set: ${String(error)}`);
    }
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
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <Button onClick={saveEditedDeployment} className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg">
                    Edit
                  </Button>
                )}

                {!isEditing && deployment && (
                  <>
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
                  </>
                )}

                <Button variant="ghost" className="text-gray-600" onClick={() => router.push('/deployment')}>
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back to Deployments
                </Button>
              </div>
            }
          />

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow lg:w-2/3 lg:max-w-2/3">
              <Tabs defaultValue="overview" className="space-y-4">
                <div className="flex justify-between items-center">
                  <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-gray-100 p-1 mb-4">
                  <TabsTrigger 
                    value="overview" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="configuration" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Performance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="audience" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Audience Insights
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content" 
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Content Analysis
                  </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview">
              <Card>
                <CardHeader className="border-b p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <BookOpenText className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg font-semibold text-gray-800">Overview</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(deployment?.status || '')} text-sm font-medium px-3 py-1`}>
                      {deployment?.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-full">
                      <h3 className="text-lg font-semibold mb-2">{campaignData.name || 'Unnamed Campaign'}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {getPlatformIcon(deployment?.platform as Platform)}
                        <span>{deployment?.platform}</span>
                        <span>•</span>
                        <span>ID: {deployment?.campaign_info?.id || 'N/A'}</span>
                      </div>
                    </div>
                    <MetricCard title="Budget Spent" value={`$${metrics?.spend?.toFixed(2) || '0.00'}`} icon={<DollarSign className="w-5 h-5" />} />
                    <MetricCard title="Impressions" value={metrics?.impressions?.toLocaleString() || '0'} icon={<Eye className="w-5 h-5" />} />
                    <MetricCard title="Clicks" value={metrics?.clicks?.toLocaleString() || '0'} icon={<MousePointerClick className="w-5 h-5" />} />
                    <MetricCard title="CTR" value={`${(metrics?.ctr * 100).toFixed(2) || '0.00'}%`} icon={<BarChart2 className="w-5 h-5" />} />
                    <MetricCard title="CPC" value={`$${metrics?.cpc?.toFixed(2) || '0.00'}`} icon={<TrendingUp className="w-5 h-5" />} />
                    <MetricCard title="Reach" value={metrics?.reach?.toLocaleString() || '0'} icon={<Users className="w-5 h-5" />} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(editedDeployment?.platform as Platform)}
                      <CardTitle className="text-lg font-semibold text-gray-800">{_.startCase(_.toLower(editedDeployment?.platform))} Campaign Information</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Campaign</h3>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-id" className={`flex items-center ${!campaignData.id ? 'text-red-500' : ''}`}>
                          ID
                          {!campaignData.id && <AlertCircle className="w-4 h-4 ml-2" />}
                        </Label>
                        <Input
                          id="campaign-id"
                          value={campaignData.id}
                          onChange={(e) => setCampaignData(prev => ({ ...prev, id: e.target.value }))}
                          className={!campaignData.id ? 'border-red-300 focus:border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campaign-name" className={`flex items-center ${!campaignData.name ? 'text-red-500' : ''}`}>
                          Name
                          {!campaignData.name && <AlertCircle className="w-4 h-4 ml-2" />}
                        </Label>
                        <Input
                          id="campaign-name"
                          value={campaignData.name}
                          onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                          className={!campaignData.name ? 'border-red-300 focus:border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campaign-objective">Objective</Label>
                        <Select
                          value={campaignData.objective}
                          onValueChange={(value) => setCampaignData(prev => ({ ...prev, objective: value }))}
                        >
                          <SelectTrigger id="campaign-objective">
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OUTCOME_ENGAGEMENT">Engagement</SelectItem>
                            <SelectItem value="OUTCOME_TRAFFIC">Traffic</SelectItem>
                            {/* Add more objectives as needed */}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>             
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center space-x-2 whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                      onClick={createCampaign}
                      disabled={!campaignData.name || !!campaignData.id}                    
                    >
                      {!campaignData.id && (
                        <>
                          <Sparkle className="w-4 h-4" />
                          <Badge className="bg-blue-50 text-blue-500 px-2 py-0.5 text-xs font-semibold rounded">
                        Auto
                      </Badge></>)}
                      <span className="ml-2">{!campaignData.id ? 'Create Campaign' : 'You\'ve already created a campaign!'}</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Ad Set</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adset-id" className={`flex items-center ${!adSetData.id ? 'text-red-500' : ''}`}>
                          ID
                          {!adSetData.id && <AlertCircle className="w-4 h-4 ml-2" />}
                        </Label>
                        <Input
                          id="adset-id"
                          value={adSetData.id || ''}
                          onChange={(e) => setAdSetData(prev => ({ ...prev, id: e.target.value }))}
                          className={!adSetData.name ? 'border-red-300 focus:border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adset-name" className={`flex items-center ${!adSetData.name ? 'text-red-500' : ''}`}>
                          Name
                          {!adSetData.name && <AlertCircle className="w-4 h-4 ml-2" />}
                        </Label>
                        <Input
                          id="adset-name"
                          value={adSetData.name || ''}
                          onChange={(e) => setAdSetData(prev => ({ ...prev, name: e.target.value }))}
                          className={!adSetData.name ? 'border-red-300 focus:border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adset-budget" className={`flex items-center ${!adSetData.dailyBudget ? 'text-red-500' : ''}`}>
                          Daily Budget
                          {!adSetData.dailyBudget && <AlertCircle className="w-4 h-4 ml-2" />}
                        </Label>
                        <Input
                          id="adset-budget"
                          type="number"
                          value={adSetData.dailyBudget?.toString()}
                          onChange={(e) => setAdSetData(prev => ({ ...prev, dailyBudget: Number(e.target.value) || null }))}
                          className={!adSetData.dailyBudget ? 'border-red-300 focus:border-red-500' : ''}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!adSetData.name || !adSetData.dailyBudget || !editedDeployment?.campaign_info?.id || !!adSetData.id}
                      className="w-full flex items-center space-x-2 whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                      onClick={createAdSet}
                    >
                      {!adSetData.id && (
                        <>
                          <Sparkle className="w-4 h-4" />
                          <Badge className="bg-blue-50 text-blue-500 px-2 py-0.5 text-xs font-semibold rounded">
                        Auto
                      </Badge></>)}
                      <span className="ml-2">{!adSetData.id ? 'Create Ad Set' : 'You\'ve already created an ad set!'}</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ad-link" className={`flex items-center ${!editedDeployment?.link ? 'text-red-500' : ''}`}>
                      Ad Link
                      {!editedDeployment?.link && <AlertCircle className="w-4 h-4 ml-2" />}
                    </Label>
                    <Input
                      id="ad-link"
                      value={String(editedDeployment?.link || '')}
                      onChange={(e) => setEditedDeployment(prev => ({ ...prev!, link: e.target.value }))}
                      className={!editedDeployment?.link ? 'border-red-300 focus:border-red-500' : ''}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3 bg-white shadow-sm">
                <CardHeader className="border-b p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-green-500" />
                      <CardTitle className="text-lg font-semibold text-gray-800">Test Configuration</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editedDeployment && Object.entries(editedDeployment).map(([key, value]) => {
                      if (['creation', 'id', 'created_at', 'updated_at', 'experiment_id', 'status', 'platform', 'adset_id', 'link', 'campaign_id', 'campaign_name', 'ad_name'].includes(key)) return null;
                      const isEditable = !['version_id', 'type'].includes(key);
                      const isRequired = requiredFields.includes(key);
                      const isEmpty = editedDeployment[key as keyof AdDeploymentWithCreation] === '';

                      if (key === 'image_url') {
                        return (
                          <div key={key} className="p-3 rounded-lg bg-gray-50 col-span-full">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {getIconForKey(key)}
                                <p className="text-sm font-medium text-gray-500 ml-2">Image URLs</p>
                              </div>
                              {isEditing && (
                                <Button onClick={addImageUrl} size="sm" variant="outline">
                                  Add URL
                                </Button>
                              )}
                            </div>
                            {editedDeployment?.creation?.image_urls?.map((url, index) => (
                              <div key={index} className="flex items-center mb-2">
                                {isEditing ? (
                                  <>
                                    <input
                                      type="text"
                                      value={url}
                                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                      className="flex-grow text-base font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none mr-2"
                                    />
                                    <Button onClick={() => removeImageUrl(index)} size="sm" variant="ghost">
                                      Remove
                                    </Button>
                                  </>
                                ) : (
                                  <p className="text-base font-semibold text-gray-900 break-all">{url}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div key={key} className={`p-3 rounded-lg ${isRequired && isEmpty ? 'bg-red-50' : 'bg-gray-50'}`}>
                          <div className="flex items-center mb-1">
                            {getIconForKey(key)}
                            <p className="text-sm font-medium text-gray-500 ml-2">{_.startCase(key)}</p>
                            {isRequired && isEmpty && (
                              <span title="Required field">
                                <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                              </span>
                            )}
                          </div>
                          {isEditing && isEditable ? (
                            <input
                              type="text"
                              value={String(value)}
                              onChange={(e) => setEditedDeployment({...editedDeployment, [key]: e.target.value})}
                              className={`text-base font-semibold text-gray-900 w-full bg-transparent border-b ${isRequired && isEmpty ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:outline-none`}
                              required={isRequired}
                            />
                          ) : (
                            <p className={`text-base font-semibold ${isRequired && isEmpty ? 'text-red-500' : 'text-gray-900'}`}>
                              {String(value) || (isRequired ? 'Required' : 'N/A')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader className="border-b p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Rabbit className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg font-semibold text-gray-800">Performance Metrics</CardTitle>
                    </div>
                    <Button size="sm" onClick={fetchMetrics} disabled={loadingMetrics} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                      {loadingMetrics ? 'Refreshing...' : 'Refresh Metrics'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Impressions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{metrics?.impressions ?? "0"}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Clicks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{metrics?.clicks ?? "0"}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">${metrics?.spend ?? "0"}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">CTR</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{(metrics?.ctr * 100).toFixed(2) ?? "0"}%</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">CPC</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">${metrics?.cpc.toFixed(2) ?? "0"}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Reach</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{metrics?.reach ?? "0"}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date_start" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#8884d8" />
                            <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#82ca9d" />
                            <Line yAxisId="right" type="monotone" dataKey="spend" stroke="#ffc658" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience">
              <Card>
                <CardHeader className="border-b p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg font-semibold text-gray-800">Audience Insights</CardTitle>
                    </div>
                    <Button size="sm" onClick={fetchMetrics} disabled={loadingMetrics} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                      {loadingMetrics ? 'Refreshing...' : 'Refresh Metrics'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Demographics</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prepareChartData(demographics?.ageGenderBreakdown ?? [])}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="ageGender" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="impressions" fill="#8884d8" />
                              <Bar dataKey="clicks" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Spend by Demographics</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prepareChartData(demographics?.ageGenderBreakdown ?? [])}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="ageGender" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="spend" fill="#ffc658" />
                            </BarChart>
                          </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="col-span-full">
                      <CardHeader>
                        <CardTitle className="text-lg">Ad Comments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {comments.length > 0 ? (
                          <ul className="space-y-2">
                            {comments.map((comment, index) => (
                              <li key={index} className="bg-gray-50 p-2 rounded">
                                <p className="font-semibold">{comment.from.name}</p>
                                <p>{comment.message}</p>
                                <p className="text-sm text-gray-500">{new Date(comment.created_time).toLocaleString()}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="space-y-2">
                            <li className="bg-gray-50 p-3 rounded">
                              <p className="font-semibold">No comments available</p>
                            </li>
                        </ul>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader className="border-b p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <CloudSun className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg font-semibold text-gray-800">Content Insights</CardTitle>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                        <Bot className="w-4 h-4 mr-1"/>
                        AI
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={fetchContentInsights} 
                      disabled={loadingInsights}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      {loadingInsights ? 'Refreshing...' : 'Refresh Insights'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {contentInsights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{contentInsights.overallPerformance}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Success Factors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {contentInsights.successFactors.map((factor: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-1" />
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Challenge Areas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {contentInsights.challengeAreas.map((challenge: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0 mt-1" />
                                <span>{challenge}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Content Improvements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {contentInsights.contentImprovements.map((improvement: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <HelpCircle className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-1" />
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Future Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {contentInsights.futureSuggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <Sparkle className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-1" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {Object.entries(contentInsights.keyMetrics).map(([key, value]: [string, any], index: number) => (
                              <li key={index} className="text-sm text-gray-600">
                                <span className="font-semibold">{key}:</span> {value}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  ) : loadingInsights ? (
                    <div className="text-center py-8">
                      <Spinner className="w-8 h-8 mx-auto mb-4" />
                      <p className="text-gray-600">Loading content insights...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No content insights available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>

          <div className="lg:w-1/3 lg:min-w-[33%] lg:sticky lg:top-4 lg:self-start mt-[82px]">
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Ad Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex items-center justify-center">
                  {renderSocialMediaEmbed()}
                </CardContent>
              </Card>
            </div>
</div>
        </div>
      </main>
    </Navbar>
  );
}