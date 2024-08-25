import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdCreationInsert } from '@/lib/types/customTypes';

interface PlatformsAndLeaningStepProps {
  adCreation: AdCreationInsert;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectChange: (name: 'platforms' | 'key_components', value: string[]) => void;
}

export default function PlatformsAndLeaningStep({ adCreation, handleInputChange, handleMultiSelectChange }: PlatformsAndLeaningStepProps) {
  return (
    <div className="space-y-4">
      <Select 
        onValueChange={(value) => handleMultiSelectChange('platforms', [value])}
        value={adCreation.platforms[0]}
      >
        <SelectTrigger>
          <SelectValue placeholder="Platforms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Facebook">Facebook</SelectItem>
          <SelectItem value="Instagram">Instagram</SelectItem>
          <SelectItem value="Twitter">Twitter</SelectItem>
          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
          <SelectItem value="TikTok">TikTok</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        onValueChange={(value) => handleInputChange({ target: { name: 'political_leaning', value } } as React.ChangeEvent<HTMLSelectElement>)}
        value={adCreation.political_leaning}
      >
        <SelectTrigger>
          <SelectValue placeholder="Political Leaning" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center-left">Center-Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="center-right">Center-Right</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
      <Input
        name="key_components"
        value={adCreation.key_components.join(', ')}
        onChange={(e) => handleMultiSelectChange('key_components', e.target.value.split(', '))}
        placeholder="Key Components (comma-separated)"
        required
      />
    </div>
  );
}