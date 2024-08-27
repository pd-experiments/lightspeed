"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beaker, Clock, FileText, ArrowLeft, ChevronRight, ChevronLeft, Tag, Building2, CirclePlayIcon, CircleStopIcon, LinkIcon, Eye, Sparkle } from 'lucide-react';
import { Calendar, Globe, Target, Users, DollarSign, BarChart2, Zap } from 'lucide-react';
import _ from 'lodash';
import Link from 'next/link';
import { AdTest } from '@/lib/types/customTypes';
import { toast } from "sonner"
import { PageHeader } from '@/components/ui/pageHeader';
import { AlertCircle } from 'lucide-react';
import { FacebookEmbed, InstagramPostEmbed, InstagramStoryEmbed, InstagramReelEmbed, TikTokEmbed, ThreadsEmbed } from '@/components/ui/socialMediaEmbeds';
import { AdCreation, AdVersion, Platform } from '@/lib/types/customTypes';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import axios from 'axios';

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

  const [creation, setCreation] = useState<AdCreation | null>(null);

  const fetchTestDetails = async () => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .select(`
        *,
        creation:ad_creations(*)
      `)
      .eq('type', 'Test')
      .eq('id', params?.id)
      .single();
  
    if (error) {
      console.error('Error fetching test details:', error);
    } else {
      setTest(data);
      setEditedTest(data);
      setCreation(data.creation);
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
      saveImageUrls();
      setIsEditing(false);
      toast.success('Test updated successfully');
    } catch (error) {
      toast.error(`Failed to update test: ${String(error)}`);
      setIsEditing(false);
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

  const [requiredFields] = useState<string[]>([
    'budget', 'placement', 'link', 'caption', 'adset_id', 'bid_strategy', 'audience', 'duration', 'type'
  ]);

  const isFormValid = () => {
    if (!editedTest) return false;
    return requiredFields.every(field => editedTest[field as keyof AdTest] !== '');
  };

  const renderSocialMediaEmbed = () => {
    if (!test || !creation) return null;

    const version: AdVersion | undefined = creation.version_data.versions.find(v => v.id === test.version_id);

    if (!version) return null;

    const imageUrls = creation.image_urls || [];

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

  const handleImageUrlChange = (index: number, value: string) => {
    if (creation) {
      const newImageUrls = [...(creation.image_urls || [])];
      newImageUrls[index] = value;
      setCreation({ ...creation, image_urls: newImageUrls });
    }
  };

  const addImageUrl = () => {
    if (creation) {
      setCreation({ ...creation, image_urls: [...(creation.image_urls || []), ''] });
    }
  };

  const removeImageUrl = (index: number) => {
    if (creation) {
      const newImageUrls = [...(creation.image_urls || [])];
      newImageUrls.splice(index, 1);
      setCreation({ ...creation, image_urls: newImageUrls });
    }
  };

  const saveImageUrls = async () => {
    if (!creation) return;

    try {
      const { data, error } = await supabase
        .from('ad_creations')
        .update({ image_urls: creation.image_urls })
        .eq('id', creation.id);

      if (error) throw error;

      toast.success('Image URLs updated successfully');
    } catch (error) {
      toast.error(`Failed to update image URLs: ${String(error)}`);
    }
  };

  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: 'OUTCOME_ENGAGEMENT',
    special_ad_categories: ['NONE'],
  });

  const [adSetData, setAdSetData] = useState({
    name: '',
    dailyBudget: '',
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

  const createCampaign = async () => {
    try {
      const response = await axios.post('/api/create/testing/create-facebook-campaign', campaignData);
      if (response.data.success) {
        setEditedTest(prev => ({ ...prev!, campaign_id: response.data.campaignId }));
        toast.success('Campaign created successfully');
      } else {
        throw new Error(response.data.error || 'Failed to create campaign');
      }
    } catch (error) {
      toast.error(`Failed to create campaign: ${String(error)}`);
    }
  };

  const createAdSet = async () => {
    if (!editedTest?.campaign_id) {
      toast.error('Please create a campaign first');
      return;
    }
    try {
      const response = await axios.post('/api/create/testing/create-facebook-ad-set', {
        ...adSetData,
        campaignId: editedTest.campaign_id,
      });
      if (response.data.success) {
        setEditedTest(prev => ({ ...prev!, adset_id: response.data.adsetId }));
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
      <main className="min-h-screen">
        <div className="max-w-[1500px] mx-auto">
          <PageHeader 
            text={`Test #${test?.id.slice(0, 8)}`}
            icons={[
              <Badge key="status" className={`${getStatusColor(test?.status || '')} text-sm font-medium px-3 py-1`}>
                {test?.status}
              </Badge>
            ]}
            rightItem={
                <div className="flex space-x-2">
                {isEditing ? (
                  <Button onClick={saveEditedTest} className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md mr-2">
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="bg-gray-800 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md mr-2">
                    Edit Test
                  </Button>
                )}
                                    {!isEditing && test && test.status === 'Created' && (
                      <Button 
                        onClick={deployTest}
                        disabled={loadingDeployTest || !isFormValid()}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingDeployTest ? 'Deploying...' : (
                          <>
                            <CirclePlayIcon className="w-4 h-4 mr-2" />
                            Deploy Test
                          </>
                        )}
                      </Button>
                    )}
                    {!isEditing && test && test.status === 'Running' && (
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md">
                        <CircleStopIcon className="w-4 h-4 mr-2" />
                        Pause Test
                      </Button>
                    )}
                    {!isEditing && test && test.status === 'Paused' && (
                      <Button className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md">
                        <CirclePlayIcon className="w-4 h-4 mr-2" />
                        Redeploy Test
                      </Button>
                    )}
                <Link href="/create/testing" className="mt-4 sm:mt-0">
                  <Button variant="ghost" className="text-gray-600">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back to Tests
                  </Button>
                </Link>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Beaker className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg font-semibold text-gray-800">Test Details</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Created', key: 'created_at', editable: false },
                      { label: 'Platform', key: 'platform', editable: false },
                    ].map(({ label, key, editable }) => (
                      <div key={key} className="p-3 rounded-lg bg-gray-50">
                        <p className="text-sm font-medium text-gray-500">{label}</p>
                        <p className="text-base font-semibold text-gray-900 break-all">
                          {key === 'created_at' 
                            ? new Date(editedTest?.[key] || '').toLocaleString()
                            : String(editedTest?.[key as keyof AdTest] || 'N/A')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(editedTest?.platform as Platform)}
                      <CardTitle className="text-lg font-semibold text-gray-800">{_.startCase(_.toLower(editedTest?.platform))} Campaign Information</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Campaign</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                      disabled={!campaignData.name}
                    >
                      <Sparkle className="w-4 h-4" />
                      <Badge className="bg-blue-50 text-blue-500 px-2 py-0.5 text-xs font-semibold rounded">
                        Auto
                      </Badge>
                      <span className="ml-2">Create Campaign</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Ad Set</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adset-name" className={`flex items-center ${!adSetData.name ? 'text-red-500' : ''}`}>
                          Name
                          {!adSetData.name && <AlertCircle className="w-4 h-4 ml-2" />}
                        </Label>
                        <Input
                          id="adset-name"
                          value={adSetData.name}
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
                          value={adSetData.dailyBudget}
                          onChange={(e) => setAdSetData(prev => ({ ...prev, dailyBudget: e.target.value }))}
                          className={!adSetData.dailyBudget ? 'border-red-300 focus:border-red-500' : ''}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!adSetData.name || !adSetData.dailyBudget || !editedTest?.campaign_id}
                      className="w-full flex items-center space-x-2 whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                      onClick={createAdSet}
                    >
                      <Sparkle className="w-4 h-4" />
                      <Badge className="bg-blue-50 text-blue-500 px-2 py-0.5 text-xs font-semibold rounded">
                        Auto
                      </Badge>
                      <span className="ml-2">Create Ad Set</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ad-link" className={`flex items-center ${!editedTest?.link ? 'text-red-500' : ''}`}>
                      Ad Link
                      {!editedTest?.link && <AlertCircle className="w-4 h-4 ml-2" />}
                    </Label>
                    <Input
                      id="ad-link"
                      value={String(editedTest?.link || '')}
                      onChange={(e) => setEditedTest(prev => ({ ...prev!, link: e.target.value }))}
                      className={!editedTest?.link ? 'border-red-300 focus:border-red-500' : ''}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  {editedTest && Object.entries(editedTest).map(([key, value]) => {
                    if (['creation', 'id', 'created_at', 'updated_at', 'experiment_id', 'status', 'platform', 'adset_id', 'link', 'campaign_id', 'campaign_name', 'ad_name'].includes(key)) return null;
                    const isEditable = !['version_id', 'type'].includes(key);
                    const isRequired = requiredFields.includes(key);
                    const isEmpty = editedTest[key as keyof AdTest] === '';

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
                          {creation?.image_urls?.map((url, index) => (
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
                            onChange={(e) => setEditedTest({...editedTest, [key]: e.target.value})}
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
          </div>
        </div>
      </main>
    </Navbar>
  );
}