import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdCreationInsert, AdContent } from '@/lib/types/customTypes';

interface AdContentStepProps {
  adCreation: AdCreationInsert & { ad_content?: AdContent };
  handleNestedInputChange: (category: 'ad_content', name: string, value: any) => void;
}

export default function AdContentStep({ adCreation, handleNestedInputChange }: AdContentStepProps) {
  return (
    <div className="space-y-4">
      <Input
        name="headline"
        value={adCreation.ad_content?.headline || ''}
        onChange={(e) => handleNestedInputChange('ad_content', 'headline', e.target.value)}
        placeholder="Ad Headline"
        required
      />
      <Textarea
        name="body"
        value={adCreation.ad_content?.body || ''}
        onChange={(e) => handleNestedInputChange('ad_content', 'body', e.target.value)}
        placeholder="Ad Body"
        required
      />
      <Input
        name="callToAction"
        value={adCreation.ad_content?.callToAction || ''}
        onChange={(e) => handleNestedInputChange('ad_content', 'callToAction', e.target.value)}
        placeholder="Call to Action"
        required
      />
      <Input
        type="file"
        name="image"
        onChange={(e) => handleNestedInputChange('ad_content', 'image', e.target.files?.[0] || null)}
        accept="image/*"
      />
    </div>
  );
}