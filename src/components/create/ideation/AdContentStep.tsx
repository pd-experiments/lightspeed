import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdExperimentInsert, AdContent } from '@/lib/types/customTypes';

interface AdContentStepProps {
  adExperiment: AdExperimentInsert & { ad_content?: AdContent };
  handleNestedInputChange: (category: 'ad_content', name: string, value: any) => void;
}

export default function AdContentStep({ adExperiment, handleNestedInputChange }: AdContentStepProps) {
  return (
    <div className="space-y-4">
      <Input
        name="headline"
        value={adExperiment.ad_content?.headline || ''}
        onChange={(e) => handleNestedInputChange('ad_content', 'headline', e.target.value)}
        placeholder="Ad Headline"
        required
      />
      <Textarea
        name="body"
        value={adExperiment.ad_content?.body || ''}
        onChange={(e) => handleNestedInputChange('ad_content', 'body', e.target.value)}
        placeholder="Ad Body"
        required
      />
      <Input
        name="callToAction"
        value={adExperiment.ad_content?.callToAction || ''}
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