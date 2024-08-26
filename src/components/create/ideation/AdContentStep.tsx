import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdCreationInsert, AdContent } from '@/lib/types/customTypes';
import { Heading, FileText, MousePointer, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface AdContentStepProps {
  adCreation: AdCreationInsert & { ad_content: AdContent };
  onUpdate: (field: string, value: any) => void;
}

export default function AdContentStep({ adCreation, onUpdate }: AdContentStepProps) {
  const [localAdContent, setLocalAdContent] = useState<AdContent>(adCreation.ad_content || {});

  useEffect(() => {
    setLocalAdContent(adCreation.ad_content || {});
  }, [adCreation.ad_content]);

  const handleAdContentChange = (name: string, value: any) => {
    const updatedAdContent = { ...localAdContent, [name]: value };
    setLocalAdContent(updatedAdContent);
    onUpdate('ad_content', updatedAdContent);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="headline" className="flex items-center text-lg font-medium text-gray-700">
          <Heading className="w-6 h-6 mr-3" />
          Ad Headline
        </label>
        <Input
          id="headline"
          name="headline"
          value={localAdContent.headline || ''}
          onChange={(e) => handleAdContentChange('headline', e.target.value)}
          placeholder="e.g., 'Vote for a Brighter Future'"
          className="w-full text-lg py-3"
          required
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="body" className="flex items-center text-lg font-medium text-gray-700">
          <FileText className="w-6 h-6 mr-3" />
          Ad Body
        </label>
        <Textarea
          id="body"
          name="body"
          value={localAdContent.body || ''}
          onChange={(e) => handleAdContentChange('body', e.target.value)}
          placeholder="e.g., 'John Doe has a proven track record of creating jobs and improving education. His plan for sustainable energy will secure our future. Join us in building a better community.'"
          className="w-full h-40 text-lg py-3"
          required
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="callToAction" className="flex items-center text-lg font-medium text-gray-700">
          <MousePointer className="w-6 h-6 mr-3" />
          Call to Action
        </label>
        <Input
          id="callToAction"
          name="callToAction"
          value={localAdContent.callToAction || ''}
          onChange={(e) => handleAdContentChange('callToAction', e.target.value)}
          placeholder="e.g., 'Learn More About Our Platform'"
          className="w-full text-lg py-3"
          required
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="image" className="flex items-center text-lg font-medium text-gray-700">
          <Image className="w-6 h-6 mr-3" />
          Ad Image
        </label>
        <div className="flex items-center space-x-3">
          <Input
            id="image"
            type="file"
            name="image"
            onChange={(e) => handleAdContentChange('image', e.target.files?.[0] || null)}
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={() => document.getElementById('image')?.click()}
            variant="outline"
            className="w-full text-lg py-3"
          >
            {localAdContent.image ? 'Change Image' : 'Upload Image'}
          </Button>
          {localAdContent.image && (
            <span className="text-lg text-gray-500">
              {(localAdContent.image as File).name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}