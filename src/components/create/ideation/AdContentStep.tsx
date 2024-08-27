import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdCreationInsert, AdContent } from '@/lib/types/customTypes';
import { Heading, FileText, MousePointer, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdContentStepProps {
  adCreation: AdCreationInsert & { ad_content: AdContent };
  onUpdate: (field: string, value: any) => void;
}

export default function AdContentStep({ adCreation, onUpdate }: AdContentStepProps) {
  const [localAdContent, setLocalAdContent] = useState<AdContent>(adCreation.ad_content || {});
  const [imageUrls, setImageUrls] = useState<string[]>(adCreation.image_urls || []);

  useEffect(() => {
    setLocalAdContent(adCreation.ad_content || {});
    setImageUrls(adCreation.image_urls || []);
  }, [adCreation.ad_content, adCreation.image_urls]);

  const handleAdContentChange = (name: string, value: any) => {
    const updatedAdContent = { ...localAdContent, [name]: value };
    setLocalAdContent(updatedAdContent);
    onUpdate('ad_content', updatedAdContent);
  };

  const addImageUrl = () => {
    const updatedUrls = [...imageUrls, ''];
    setImageUrls(updatedUrls);
    onUpdate('image_urls', updatedUrls);
  };

  const updateImageUrl = (index: number, value: string) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    setImageUrls(updatedUrls);
    onUpdate('image_urls', updatedUrls);
  };

  const removeImageUrl = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    onUpdate('image_urls', updatedUrls);
  };

  const [showAllImages, setShowAllImages] = useState(false);
  const visibleImages = showAllImages ? imageUrls : imageUrls.slice(0, 3);
  const hiddenImagesCount = imageUrls.length - 3;

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
        <label className="flex items-center text-lg font-medium text-gray-700">
          <ImageIcon className="w-6 h-6 mr-3" />
          Ad Images
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {visibleImages.map((url, index) => (
            url && (
              <div key={`preview-${index}`} className="relative w-40 h-40 bg-gray-200 rounded-md p-1">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            )
          ))}
          {!showAllImages && hiddenImagesCount > 0 && (
            <Button
              onClick={() => setShowAllImages(true)}
              variant="outline"
              className="w-24 h-24 flex flex-col items-center justify-center text-sm"
            >
              <ChevronDown className="w-4 h-4 mb-1" />
              +{hiddenImagesCount} more
            </Button>
          )}
          {showAllImages && hiddenImagesCount > 0 && (
            <Button
              onClick={() => setShowAllImages(false)}
              variant="outline"
              className="w-24 h-24 flex flex-col items-center justify-center text-sm"
            >
              <ChevronUp className="w-4 h-4 mb-1" />
              Show less
            </Button>
          )}
        </div>
        {imageUrls.map((url, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={url}
              onChange={(e) => updateImageUrl(index, e.target.value)}
              placeholder="Enter image URL"
              className="flex-grow"
            />
            <Button onClick={() => removeImageUrl(index)} variant="outline" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addImageUrl} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add Image URL
        </Button>
      </div>
{/* 
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
      </div> */}
    </div>
  );
}