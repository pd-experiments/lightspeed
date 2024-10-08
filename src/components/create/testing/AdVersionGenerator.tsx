import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Spinner } from '@/components/ui/Spinner';
import { AlertTriangle, Megaphone, SparklesIcon } from 'lucide-react';
import { AdCreation } from '@/lib/types/customTypes';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FacebookEmbed, InstagramPostEmbed, InstagramStoryEmbed, InstagramReelEmbed, TikTokEmbed, ThreadsEmbed } from '@/components/ui/socialMediaEmbeds';
import { supabase } from '@/lib/supabaseClient';

interface AdVersionGeneratorProps {
  experiment: AdCreation;
}

type Platform = 'Facebook' | 'Instagram Post' | 'Instagram Story' | 'Instagram Reel' | 'TikTok' | 'Threads';
export type AdVersion = {
    id: string;
    platform: Platform;
    textContent: string;
    images?: string[];
    image?: string;
    videoDescription?: string;
    inVideoScript?: string;
    hashtags: string[];
};

export default function AdVersionGenerator({ experiment }: AdVersionGeneratorProps) {
    const [generatedVersions, setGeneratedVersions] = useState<AdVersion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Facebook', 'Instagram Post', 'TikTok']);    const [toneOfVoice, setToneOfVoice] = useState<string>('Neutral');
    const [creativityLevel, setCreativityLevel] = useState<number>(50);
    const [targetAudience, setTargetAudience] = useState<string>(() => {
      if (Array.isArray(experiment.target_audience)) {
        return experiment.target_audience.join(', ');
      } else if (typeof experiment.target_audience === 'object') {
        return Object.values(experiment.target_audience || {}).flat().join(', ');
      } else {
        return String(experiment.target_audience);
      }
    });
    const [keyMessage, setKeyMessage] = useState<string>('');
    const [numVersions, setNumVersions] = useState<number>(2);
    const [error, setError] = useState<string | null>(null);

    const generateAdVersions = async () => {
        setIsGenerating(true);
        setError(null);
        try {
          const response = await fetch('/api/create/testing/generate-ad-versions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              experiment,
              platforms: selectedPlatforms,
              toneOfVoice,
              creativityLevel,
              targetAudience,
              keyMessage,
              numVersions,
            }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to generate ad versions');
          }
      
          const data = await response.json();
          setGeneratedVersions(data);
      
          const versionData = {
            versions: data,
            config: {
              platforms: selectedPlatforms,
              toneOfVoice,
              creativityLevel,
              targetAudience,
              keyMessage,
              numVersions,
            }
          };
      
          const { error: supabaseError } = await supabase
            .from('ad_creations')
            .update({ status: 'Generated', version_data: versionData })
            .eq('id', experiment.id);
      
          if (supabaseError) {
            console.error('Error saving version data to Supabase:', supabaseError);
          }
        } catch (err) {
          setError('An error occurred while generating ad versions. Please try again.');
          console.error('Error generating ad versions:', err);
        } finally {
          setIsGenerating(false);
        }
      };

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

    if (data && data.version_data) {
        setGeneratedVersions(data.version_data.versions);
        if (data.version_data.config) {
        setSelectedPlatforms(data.version_data.config.platforms);
        setToneOfVoice(data.version_data.config.toneOfVoice);
        setCreativityLevel(data.version_data.config.creativityLevel);
        setTargetAudience(data.version_data.config.targetAudience);
        setKeyMessage(data.version_data.config.keyMessage);
        setNumVersions(data.version_data.config.numVersions);
        }
    }
    };

  useEffect(() => {
        fetchExistingVersions();
  }, [experiment.id]);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <Card className="bg-white shadow-sm flex flex-col h-full">
        <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
            <CardTitle className="text-xl font-semibold text-gray-800">
            Ad Generation Configuration
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
            <div className="space-y-4 p-2 flex-grow overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold mb-2">Original Ad Content</h2>
              <p className="text-gray-600 mb-1"><strong>Headline:</strong> {experiment.ad_content?.headline}</p>
              <p className="text-gray-600 mb-1"><strong>Body:</strong> {experiment.ad_content?.body}</p>
              <p className="text-gray-600"><strong>Call to Action:</strong> {experiment.ad_content?.callToAction}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Platforms</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(['Facebook', 'Instagram Post', 'Instagram Story', 'Instagram Reel', 'TikTok', 'Threads'] as Platform[]).map((platform) => (
                  <Badge
                    key={platform}
                    className={`cursor-pointer ${selectedPlatforms.includes(platform) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    onClick={() => setSelectedPlatforms(prev => 
                      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
                    )}
                  >
                    {getPlatformIcon(platform)}
                    <span className="ml-1">{platform}</span>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tone of Voice</label>
              <Select value={toneOfVoice} onValueChange={setToneOfVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tone of voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="Authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Creativity Level</label>
              <Slider
                value={[creativityLevel]}
                onValueChange={(value) => setCreativityLevel(value[0])}
                max={100}
                step={1}
              />
              <div className="text-sm text-gray-500 mt-1">
                {creativityLevel < 33 ? 'Conservative' : creativityLevel < 66 ? 'Balanced' : 'Innovative'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Audience</label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Young professionals, age 25-35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Key Message Notes (Optional, Recommended)</label>
              <Textarea
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                placeholder="Enter additional information about the main message or focus of the ad"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Number of Versions</label>
                <Input
                    type="number"
                    value={numVersions}
                    onChange={(e) => setNumVersions(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={5}
                    className="mt-1"
                />
            </div>
            </div>
            <div className="mt-4 pt-4 border-t">
                <Button 
                    onClick={generateAdVersions} 
                    disabled={isGenerating || selectedPlatforms.length === 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                    {isGenerating ? (
                    <Spinner className="w-5 h-5 mr-2" />
                    ) : (
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    )}
                    <span>
                    {isGenerating ? 'Generating...' : generatedVersions.length > 0 ? 'Regenerate' : 'Generate'}
                    </span>
                </Button>
                {error && (
                    <div className="mt-3 text-red-500 text-sm flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>{error}</span>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm flex flex-col h-full">
        <CardHeader className="border-b bg-gray-50 p-4 rounded-t-md">
            <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
            <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
            Generated Ad Versions
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 w-full h-full flex flex-col">
            {isGenerating ? (
            <div className="flex-grow flex justify-center items-center">
                <Spinner className="w-8 h-8 text-blue-500" />
            </div>
          ) : generatedVersions.length > 0 ? (
            <div className="space-y-8">
              {selectedPlatforms.map((platform) => {
                    const platformVersions = generatedVersions.filter((version) => version.platform === platform);
                    if (platformVersions.length === 0) return null;
              
                    return (
                      <div key={platform} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 flex items-center">
                          {getPlatformIcon(platform)}
                          <h3 className="ml-2 text-sm font-medium text-gray-700">{platform}</h3>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          {platformVersions.map((version) => (
                            <AccordionItem key={version.id} value={version.id} className="border-b last:border-b-0">
                                <AccordionTrigger className="hover:no-underline px-4 py-2">
                                <div className="flex justify-between items-center w-full">
                                    <h4 className="font-medium text-gray-800 text-left text-sm">
                                    {version.textContent && version.textContent.length > 50
                                        ? `${version.textContent.slice(0, 50)}...`
                                        : version.textContent || 'No content'}
                                    </h4>
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Version {version.id.includes('-') ? version.id.split('-').pop() : version.id}
                                    </Badge>
                                </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-2">
                                <div className="space-y-4">
                                    {platform === 'Facebook' && <FacebookEmbed version={version} imageUrls={experiment.image_urls || []} />}
                                    {platform === 'Instagram Post' && <InstagramPostEmbed version={version} imageUrls={experiment.image_urls || []} />}
                                    {platform === 'Instagram Story' && <InstagramStoryEmbed version={version} imageUrls={experiment.image_urls || []} />}
                                    {platform === 'Instagram Reel' && <InstagramReelEmbed version={version} />}
                                    {platform === 'TikTok' && <TikTokEmbed version={version} />}
                                    {platform === 'Threads' && <ThreadsEmbed version={version} imageUrls={experiment.image_urls || []} />}
                                    <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Text Content:</strong> {version.textContent}</p>
                                    {version.videoDescription && (
                                        <p className="text-sm text-gray-600"><strong>Video Description:</strong> {version.videoDescription}</p>
                                    )}
                                    {version.inVideoScript && (
                                        <p className="text-sm text-gray-600"><strong>In-Video Script:</strong> {version.inVideoScript}</p>
                                    )}
                                    <p className="text-sm text-gray-600"><strong>Hashtags:</strong> {version.hashtags.join(' ')}</p>
                                    </div>
                                </div>
                                </AccordionContent>
                            </AccordionItem>
                            ))}
                        </Accordion>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-grow flex justify-center items-center px-6">
                    <p className="text-center text-gray-500">
                    No versions generated yet. Select platforms and click the button to generate ad versions.
                    </p>
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  );
}