import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdDeploymentWithCreation, Platform } from '@/lib/types/customTypes';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, Zap, ArrowLeft, Tag, GalleryHorizontalEnd } from 'lucide-react';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FacebookEmbed, InstagramPostEmbed, InstagramStoryEmbed, InstagramReelEmbed, TikTokEmbed, ThreadsEmbed } from '@/components/ui/socialMediaEmbeds';
import { AdVersion } from '@/components/create/testing/AdVersionGenerator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdTestListProps {
  adTests: AdDeploymentWithCreation[];
  getStatusColor: (status: string) => string;
  selectExperiment: (experiment: AdDeploymentWithCreation['creation']) => void;
  selectTest: (testId: string) => void;
}

export default function AdTestList({ adTests, getStatusColor, selectExperiment, selectTest, isLoading = false }: AdTestListProps & { isLoading?: boolean }) {
  const router = useRouter();
  const [openCreations, setOpenCreations] = useState<Record<string, boolean>>({});
  const [activePlatforms, setActivePlatforms] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (adTests.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No ad tests available.</p>
        </CardContent>
      </Card>
    );
  }

  const updateType = async (id: string, type: string) => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .update({ type: type })
      .eq('id', id)
      .select()
      .single();
  };

  const groupedTests = adTests.reduce((acc, test) => {
    const creationId = test.creation.id;
    const platform = test.platform;
    if (!acc[creationId]) acc[creationId] = {};
    if (!acc[creationId][platform]) acc[creationId][platform] = [];
    acc[creationId][platform].push(test);
    return acc;
  }, {} as Record<string, Record<string, AdDeploymentWithCreation[]>>);

  const renderSocialMediaEmbed = (test: AdDeploymentWithCreation) => {
    const versionData = test.creation.version_data as { versions: AdVersion[] } | null;
    if (!versionData || !versionData.versions) return null;
  
    const version = versionData.versions.find(v => v.id === test.version_id);
    if (!version) return null;
  
    switch (test.platform) {
      case 'Facebook':
        return <FacebookEmbed version={version} imageUrls={test.creation.image_urls || []} />;
      case 'Instagram Post':
        return <InstagramPostEmbed version={version} imageUrls={test.creation.image_urls || []}/>;
      case 'Instagram Story':
        return <InstagramStoryEmbed version={version} />;
      case 'Instagram Reel':
        return <InstagramReelEmbed version={version} />;
      case 'TikTok':
        return <TikTokEmbed version={version} />;
      case 'Threads':
        return <ThreadsEmbed version={version} imageUrls={test.creation.image_urls || []}/>;
      default:
        return null;
    }
  };

  const getPoliticalLeaningBorderColor = (leaning: string) => {
    switch (leaning.toLowerCase()) {
      case 'liberal': return 'border-blue-500';
      case 'conservative': return 'border-red-500';
      case 'moderate': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };


  return (
    <div className="space-y-8">
      {Object.entries(groupedTests).map(([creationId, platforms]) => {
        const platformNames = Object.keys(platforms);
        const activePlatform = activePlatforms[creationId] || platformNames[0];
        const firstTest = platforms[platformNames[0]][0];

        return (
          <Collapsible
            key={creationId}
            open={openCreations[creationId] !== false}
            onOpenChange={(isOpen) => setOpenCreations(prev => ({ ...prev, [creationId]: isOpen }))}
          >
            <Card className={`overflow-hidden shadow-md border-l-4 ${getPoliticalLeaningBorderColor(firstTest.creation.political_leaning || '')}`}>
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      {getPlatformIcon(platformNames[0] as Platform, 6)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 truncate">{firstTest.creation.title}</h2>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(firstTest.creation.created_at || '').toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {platformNames.length} Platform{platformNames.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {Object.values(platforms).reduce((total, tests) => total + tests.length, 0)} Tests
                    </Badge>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${openCreations[creationId] === false ? '' : 'transform rotate-180'}`} />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4 bg-gray-50">
                  <Tabs 
                    value={activePlatform} 
                    onValueChange={(value) => setActivePlatforms(prev => ({ ...prev, [creationId]: value }))}
                  >
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-md mb-4 bg-muted p-1">
                      {platformNames.map((platform) => (
                        <TabsTrigger key={platform} value={platform} className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                          {getPlatformIcon(platform as Platform, 4)}
                          <span className="ml-2">{platform}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {platformNames.map((platform) => (
                      <TabsContent key={platform} value={platform}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {platforms[platform].map((test, index) => (
                            <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-4 flex flex-col h-full">
                                <div className="flex-grow">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Test #{test.id.slice(0, 8)}</h4>
                                    <div className="flex space-x-1">
                                      <Badge className={`${getStatusColor(test.status)} text-xs`}>
                                        {test.status}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs bg-blue-500 text-white">
                                        Version {index + 1}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    {renderSocialMediaEmbed(test)}
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                                      <span className="truncate">{new Date(test.created_at || '').toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Users className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                                      <span className="truncate">{test.audience}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                                      <span className="font-semibold truncate">${test.budget}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-auto pt-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-800 whitespace-normal w-full justify-between text-left"
                                    onClick={() => router.push(`/create/testing/${test.id}`)}
                                  >
                                    <span>
                                      {test.status === 'Deployed' ? 'View' : test.status === 'Running' ? 'Progress' : test.status === 'Created' ? 'Deploy' : 'View'}
                                    </span>
                                    <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
                                  </Button>
                                  {test.type === 'Test' && test.status === 'Deployed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 hover:text-blue-800 whitespace-normal bg-blue-50 hover:bg-blue-100 font-semibold w-full mt-2 text-left"
                                      onClick={() => updateType(test.id, 'Standard')}
                                    >
                                      <GalleryHorizontalEnd className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span>Move to Standard</span>
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}