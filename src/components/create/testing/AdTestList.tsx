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
import { useState } from 'react';

interface AdTestListProps {
  adTests: AdDeploymentWithCreation[];
  getStatusColor: (status: string) => string;
  selectExperiment: (experiment: AdDeploymentWithCreation['creation']) => void;
  selectTest: (testId: string) => void;
}

export default function AdTestList({ adTests, getStatusColor, selectExperiment, selectTest, isLoading = false }: AdTestListProps & { isLoading?: boolean }) {
  const router = useRouter();
  const [openCreations, setOpenCreations] = useState<Record<string, boolean>>({});

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
        return <FacebookEmbed version={version} />;
      case 'Instagram Post':
        return <InstagramPostEmbed version={version} />;
      case 'Instagram Story':
        return <InstagramStoryEmbed version={version} />;
      case 'Instagram Reel':
        return <InstagramReelEmbed version={version} />;
      case 'TikTok':
        return <TikTokEmbed version={version} />;
      case 'Threads':
        return <ThreadsEmbed version={version} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedTests).map(([creationId, platforms]) => (
        <Collapsible
          key={creationId}
          open={openCreations[creationId] !== false}
          onOpenChange={(isOpen) => setOpenCreations(prev => ({ ...prev, [creationId]: isOpen }))}
        >
          <Card className="overflow-hidden shadow-md">
          <CollapsibleTrigger className="w-full">
              <CardContent className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <div className="flex items-center mb-1">
                    <h2 className="text-xl font-semibold text-gray-800 mr-2">
                      {platforms[Object.keys(platforms)[0]][0].creation.title}
                    </h2>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {Object.values(platforms).reduce((total, tests) => total + tests.length, 0)} Tests
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    {platforms[Object.keys(platforms)[0]][0].creation.description}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/create/generate/${platforms[Object.keys(platforms)[0]][0].creation.id}`);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Creation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white hover:text-gray-50 transition-colors duration-200"
                  >
                    {openCreations[creationId] === false ? 'View Tests' : 'Hide Tests'} 
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${openCreations[creationId] === false ? '' : 'transform rotate-180'}`} />
                  </Button>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 space-y-4">
                {Object.entries(platforms).map(([platform, tests]) => (
                  <div key={platform} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(platform as Platform, 6)}
                      <h3 className="text-md font-medium text-gray-700">{platform}</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tests.map((test, index) => (
                        <Card key={test.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-md font-semibold text-gray-700">Test #{test.id.slice(0, 8)}</h3>
                            <div className="flex space-x-2">
                              <Badge className={`${getStatusColor(test.status)} text-xs`}>
                                {test.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Version {index + 1}
                              </Badge>
                            </div>
                          </div>
                          <div className="mb-4">
                            {renderSocialMediaEmbed(test)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              <span>{new Date(test.created_at || '').toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="font-semibold">${test.budget}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1 text-gray-400" />
                              <span>{test.audience}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => router.push(`/create/testing/${test.id}`)}
                            >
                              {test.status === 'Deployed' ? 'View' : test.status === 'Running' ? 'Progress' : test.status === 'Created' ? 'Deploy' : 'View'}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>

                        {test.type === 'Test' && test.status === 'Deployed' && (
                          <div className="bg-gray-50 p-2 border-t">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-blue-600 hover:text-blue-800 text-xs"
                              onClick={() => updateType(test.id, 'Standard')}
                            >
                              <GalleryHorizontalEnd className="w-3 h-3 mr-1" />
                              Move to Standard Deployment
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}