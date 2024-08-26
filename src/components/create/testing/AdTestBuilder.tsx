import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdCreation, AdVersion } from '@/lib/types/customTypes';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, CheckCircle, Settings, Blocks, Megaphone } from 'lucide-react';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { FacebookEmbed, InstagramPostEmbed, InstagramStoryEmbed, InstagramReelEmbed, TikTokEmbed, ThreadsEmbed } from '@/components/ui/socialMediaEmbeds';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/Spinner';

interface AdTestBuilderProps {
  experiment: AdCreation;
}

type Platform = 'Facebook' | 'Instagram Post' | 'Instagram Story' | 'Instagram Reel' | 'TikTok' | 'Threads';

type TestConfig = {
  [key in Platform]?: {
    [versionId: string]: {
      selected: boolean;
      budget: number;
      duration: number;
      audience: string;
      placement: string;
      bidStrategy: string;
      imageUrl: string;
      videoUrl?: string;
      caption: string;
      link: string;
      adsetId: string;
    };
  };
};

export default function AdTestBuilder({ experiment }: AdTestBuilderProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [progress, setProgress] = useState(0);
  const [testConfig, setTestConfig] = useState<TestConfig>({});
  const [generatedVersions, setGeneratedVersions] = useState<AdVersion[]>([]);

  useEffect(() => {
    fetchExistingVersions();
  }, [experiment.id]);

  const fetchExistingVersions = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select('version_data')
      .eq('id', experiment.id)
      .single();

    if (error) {
      console.error('Error fetching existing version data:', error);
      return;
    }

    if (data && data.version_data && data.version_data.versions) {
      setGeneratedVersions(data.version_data.versions);
      initializeTestConfig(data.version_data.versions);
    }
  };

  const initializeTestConfig = (versions: AdVersion[]) => {
    const newConfig: TestConfig = {};
    let firstVersionId: string | null = null;
    let firstPlatform: Platform | null = null;
  
    versions.forEach((version, index) => {
      if (!newConfig[version.platform]) {
        newConfig[version.platform] = {};
      }
      newConfig[version.platform]![version.id] = {
        selected: index === 0, 
        budget: 100,
        duration: 7,
        audience: 'Default',
        placement: 'Automatic',
        bidStrategy: 'Lowest cost',
        imageUrl: version.imageUrl || '',
        videoUrl: version.videoUrl || '',
        caption: version.textContent || '',
        link: version.link || '',
        adsetId: '',
      };
  
      if (index === 0) {
        firstVersionId = version.id;
        firstPlatform = version.platform;
      }
    });
  
    console.log("Initialized TestConfig:", newConfig);
    setTestConfig(newConfig);
  
    if (firstPlatform && firstVersionId) {
      setSelectedConfigVersion(`${firstPlatform}-${firstVersionId}`);
    }
  };

  const saveAdTest = async () => {
    setTestStatus('saving');
    setProgress(0);
  
    const selectedVersions = Object.entries(testConfig).flatMap(([platform, versions]) =>
      Object.entries(versions)
        .filter(([_, config]) => config.selected)
        .map(([versionId, config]) => ({ platform, versionId, config }))
    );
  
    try {
      for (const { platform, versionId, config } of selectedVersions) {
        const { data, error } = await supabase
          .from('ad_deployments')
          .insert({
            experiment_id: experiment.id,
            platform,
            version_id: versionId,
            budget: config.budget,
            duration: config.duration,
            audience: config.audience,
            placement: config.placement,
            bid_strategy: config.bidStrategy,
            image_url: config.imageUrl,
            video_url: config.videoUrl,
            caption: config.caption,
            link: config.link,
            adset_id: config.adsetId,
            status: 'Created',
            created_at: new Date().toISOString(),
            type: 'Test'
          })
          .select();

        if (error) throw error;
        console.log('Ad test saved:', data);
      }

      await supabase
        .from('ad_creations')
        .update({ 
          status: 'Test Created',
          flow: 'Testing'
        })
        .eq('id', experiment.id);
  
      setTestStatus('saved');
      setProgress(100);
    } catch (error) {
      console.error('Error saving ad test:', error);
      setTestStatus('idle');
    }
  };

  const handleConfigChange = (
    platform: Platform, 
    versionId: string, 
    field: keyof NonNullable<TestConfig[Platform]>[string], 
    value: any
  ) => {
    setTestConfig((prev) => {
      const newConfig = {
        ...prev,
        [platform]: {
          ...prev[platform],
          [versionId]: {
            ...prev[platform]?.[versionId],
            [field]: value,
          },
        },
      };
  
      if (field === 'selected' && value === false) {
        if (selectedConfigVersion === `${platform}-${versionId}`) {
          setSelectedConfigVersion(null);
        }
      }

      if (selectedConfigVersion === null) {
        setSelectedConfigVersion(getSelectedVersions()[0] || null);
      }
  
      return newConfig;
    });
  };

  const handleConfigVersionChange = (value: string) => {
    setSelectedConfigVersion(value);
  };

  const renderSocialMediaEmbed = (version: AdVersion) => {
    switch (version.platform) {
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

  const handleVersionSelection = (platform: Platform, versionId: string, value: boolean) => {
    setTestConfig(prev => {
      const newConfig = { ...prev };
      if (newConfig[platform] && newConfig[platform]![versionId]) {
        newConfig[platform]![versionId].selected = value;
      }
      return newConfig;
    });
  };

  const getSelectedVersions = () => {
    return Object.entries(testConfig).flatMap(([platform, versions]) =>
      Object.entries(versions)
        .filter(([_, config]) => config.selected)
        .map(([versionId, _]) => `${platform}-${versionId}`)
    );
  };

  const [selectedConfigVersion, setSelectedConfigVersion] = useState<string | null>(null);

  const platformsWithVersions = Object.keys(testConfig).filter(platform => 
    generatedVersions.some(v => v.platform === platform)
  );
  
  const [defaultPlatform, setDefaultPlatform] = useState<Platform | null>(null);
  const [defaultVersionId, setDefaultVersionId] = useState<string | null>(null);
  const [defaultValue, setDefaultValue] = useState<string | null>(null);

  useEffect(() => {
    const platformsWithVersions = Object.keys(testConfig).filter(platform => 
      generatedVersions.some(v => v.platform === platform)
    );

    const newDefaultPlatform = platformsWithVersions.length > 0 ? platformsWithVersions[0] as Platform : null;
    setDefaultPlatform(newDefaultPlatform);

    if (newDefaultPlatform) {
      const newDefaultVersionId = Object.keys(testConfig[newDefaultPlatform] || {}).find(versionId => 
        generatedVersions.some(v => v.platform === newDefaultPlatform && v.id === versionId)
      ) || null;
      setDefaultVersionId(newDefaultVersionId);

      if (newDefaultVersionId) {
        setDefaultValue(`${newDefaultPlatform}-${newDefaultVersionId}`);
      } else {
        setDefaultValue(null);
      }
    } else {
      setDefaultVersionId(null);
      setDefaultValue(null);
    }

    if (defaultValue) {
      const [platform, versionId] = defaultValue.split('-');
      if (testConfig[platform as Platform]?.[versionId]) {
        setSelectedConfigVersion(defaultValue);
      }
    }
  }, [testConfig, generatedVersions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm flex flex-col h-full">
        {/* <CardHeader className="border-b p-3 bg-blue-500 rounded-t-md">
          <CardTitle className="text-sm font-medium flex items-center text-white">
            <Settings className="w-4 h-4 mr-2 text-white" />
            Configuration
          </CardTitle>
        </CardHeader> */}
        <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
            <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
            <Settings className="w-5 h-5 mr-2 text-blue-500" />
            Test Configuration
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow overflow-y-auto">
          {defaultValue && (
            <Select
              value={selectedConfigVersion || ''}
              onValueChange={handleConfigVersionChange}
            >
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder={`${getSelectedVersions().length > 0 ? "Select version to configure" : "No versions selected"}`} />
              </SelectTrigger>
              <SelectContent>
                {getSelectedVersions().map((version) => {
                  const parts = version.split('-');
                  const versionNumber = parts.pop();
                  const platform = parts[0] as Platform;
                  return (
                    <SelectItem key={version} value={version}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {getPlatformIcon(platform)}
                          <span className="ml-2 font-medium text-gray-800 text-sm">{platform}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 text-xs ml-10">
                          Version {versionNumber}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          {selectedConfigVersion && (() => {
            const parts = selectedConfigVersion.split('-');
            const versionId = parts.slice(1).join('-');
            const platform = parts[0] as Platform;
            const config = testConfig[platform]?.[versionId];
  
            if (!config) {
              return (
                <div>No configuration found for this version. Please select the version in the Ad Versions section to initialize its configuration.</div>
              );
            }
  
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={config.budget}
                        onChange={(e) => handleConfigChange(platform, versionId, 'budget', parseInt(e.target.value))}
                        className="w-full"
                        placeholder="Budget"
                      />
                      <span className="ml-2 text-sm text-gray-500">USD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={config.duration}
                        onChange={(e) => handleConfigChange(platform, versionId, 'duration', parseInt(e.target.value))}
                        className="w-full"
                        placeholder="Duration"
                      />
                      <span className="ml-2 text-sm text-gray-500">days</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <Select
                    value={config.audience}
                    onValueChange={(value) => handleConfigChange(platform, versionId, 'audience', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Default">Default</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                      <SelectItem value="Lookalike">Lookalike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Placement</label>
                  <Select
                    value={config.placement}
                    onValueChange={(value) => handleConfigChange(platform, versionId, 'placement', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bid Strategy</label>
                  <Select
                    value={config.bidStrategy}
                    onValueChange={(value) => handleConfigChange(platform, versionId, 'bidStrategy', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select bid strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lowest cost">Lowest cost</SelectItem>
                      <SelectItem value="Cost cap">Cost cap</SelectItem>
                      <SelectItem value="Bid cap">Bid cap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <Input
                    type="text"
                    value={config.imageUrl}
                    onChange={(e) => handleConfigChange(platform, versionId, 'imageUrl', e.target.value)}
                    className="w-full"
                    placeholder="Image URL"
                  />
                </div>
                {platform === 'Instagram Reel' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                    <Input
                      type="text"
                      value={config.videoUrl}
                      onChange={(e) => handleConfigChange(platform, versionId, 'videoUrl', e.target.value)}
                      className="w-full"
                      placeholder="Video URL"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <Textarea
                    value={config.caption}
                    onChange={(e) => handleConfigChange(platform, versionId, 'caption', e.target.value)}
                    className="w-full"
                    placeholder="Caption"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <Input
                    type="text"
                    value={config.link}
                    onChange={(e) => handleConfigChange(platform, versionId, 'link', e.target.value)}
                    className="w-full"
                    placeholder="Link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Set ID</label>
                  <Input
                    type="text"
                    value={config.adsetId}
                    onChange={(e) => handleConfigChange(platform, versionId, 'adsetId', e.target.value)}
                    className="w-full"
                    placeholder="Ad Set ID"
                  />
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm">
        {/* <CardHeader className="border-b p-3 bg-blue-500 rounded-t-md">
          <CardTitle className="text-sm font-medium flex items-center text-white">
            <PlayCircle className="w-4 h-4 mr-2 text-white" />
            Versions
          </CardTitle>
        </CardHeader> */}
        <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
            <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
            <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
            Versions
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {defaultPlatform ? (
          <Tabs defaultValue={String(defaultPlatform)} className="w-full">
            <TabsList className="flex flex-wrap justify-start items-center p-1 gap-2 mb-4">
              {Object.keys(testConfig).map((platform) => (
                <TabsTrigger 
                  key={platform} 
                  value={platform} 
                >
                  {getPlatformIcon(platform as Platform)}
                  <span className="ml-2">{platform}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(testConfig).map(([platform, versions]) => {
              const platformVersions = generatedVersions.filter(v => v.platform === platform);
              if (platformVersions.length === 0) return null;

              return (
                <TabsContent key={platform} value={platform}>
                  <Carousel className="w-full max-w-xs mx-auto">
                    <CarouselContent>
                      {platformVersions.map((version, index) => (
                        <CarouselItem key={version.id}>
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="relative">
                                {renderSocialMediaEmbed(version)}
                                <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                                  Version {index + 1}
                                </Badge>
                              </div>
                              <div className="p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`w-full rounded-md text-white ${!versions[version.id]?.selected ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                                    onClick={() => handleVersionSelection(platform as Platform, version.id, !versions[version.id]?.selected)}
                                  >
                                    {versions[version.id]?.selected ? (
                                      "Queued"
                                    ) : (
                                      "Add to Test Queue"
                                    )}
                                  </Button>
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value="details">
                                    <AccordionTrigger className="py-2 text-sm font-medium text-gray-600">
                                      View Details
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-2 text-sm text-gray-600">
                                        <p><strong>Text Content:</strong> {version.textContent}</p>
                                        {version.videoDescription && (
                                          <p><strong>Video Description:</strong> {version.videoDescription}</p>
                                        )}
                                        {version.inVideoScript && (
                                          <p><strong>In-Video Script:</strong> {version.inVideoScript}</p>
                                        )}
                                        <p><strong>Hashtags:</strong> {version.hashtags.join(' ')}</p>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </TabsContent>
              );
            })}
          </Tabs>
          ) : (
            <p>No platforms with versions available</p>
          )}
        </CardContent>
      </Card>
      <div className="col-span-1 lg:col-span-2">
        <Button
          onClick={saveAdTest}
          disabled={testStatus === 'saving'}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md shadow-md transition-all duration-300 ease-in-out flex items-center justify-center"
        >
          {testStatus === 'idle' ? (
            <>
              <Blocks className="w-5 h-5 mr-2" />
              <span>Build New Test(s)</span>
            </>
          ) : testStatus === 'saving' ? (
            <>
              <Spinner className="w-5 h-5 mr-2 animate-pulse" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Test(s) Saved</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}