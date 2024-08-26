import { AdCreationInsert } from '@/lib/types/customTypes';
import { useState, useEffect } from 'react';
import { getPlatformIcon, getPoliticalIcon } from '@/lib/helperUtils/create/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlatformsAndLeaningStepProps {
  adCreation: AdCreationInsert;
  onUpdate: (field: string, value: any) => void;
}

const platforms = ['Facebook', 'Instagram Post', 'Instagram Story', 'Instagram Reel', 'TikTok', 'Threads'];
const politicalLeanings = ['left', 'center-left', 'center', 'center-right', 'right'];

export default function PlatformsAndLeaningStep({ adCreation, onUpdate }: PlatformsAndLeaningStepProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(adCreation.platforms || []);
  const [politicalLeaning, setPoliticalLeaning] = useState<string>(adCreation.political_leaning || '');
  const [keyComponents, setKeyComponents] = useState<string>(adCreation.key_components.join(', ') || '');

  useEffect(() => {
    onUpdate('platforms', selectedPlatforms);
  }, [selectedPlatforms]);

  useEffect(() => {
    onUpdate('political_leaning', politicalLeaning);
  }, [politicalLeaning]);

  useEffect(() => {
    onUpdate('key_components', keyComponents.split(', ').filter(Boolean));
  }, [keyComponents]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-3">Select Platforms</h3>
        <div className="flex flex-wrap gap-3">
          {platforms.map(platform => (
            <Button
              key={platform}
              variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
              size="lg"
              onClick={() => togglePlatform(platform)}
              className="flex items-center space-x-2 text-lg"
            >
              {getPlatformIcon(platform as any, 6)}
              <span>{platform}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Political Leaning</h3>
        <div className="flex flex-wrap gap-3">
          {politicalLeanings.map(leaning => (
            <Button
              key={leaning}
              variant={politicalLeaning === leaning ? "default" : "outline"}
              size="lg"
              onClick={() => setPoliticalLeaning(leaning)}
              className="flex items-center space-x-2 text-lg"
            >
              {getPoliticalIcon(leaning, 6)}
              <span className="capitalize">{leaning}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Key Components</h3>
        <Input
          value={keyComponents}
          onChange={(e) => setKeyComponents(e.target.value)}
          placeholder="Enter key components (comma-separated)"
          className="w-full text-lg py-3"
        />
      </div>
    </div>
  );
}