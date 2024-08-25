import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdCreationInsert } from '@/lib/types/customTypes';

interface BasicInformationStepProps {
  adCreation: AdCreationInsert;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function BasicInformationStep({ adCreation, handleInputChange }: BasicInformationStepProps) {
  return (
    <div className="space-y-4">
      <Input
        name="title"
        value={adCreation.title}
        onChange={handleInputChange}
        placeholder="Experiment Title"
        required
      />
      <Textarea
        name="description"
        value={adCreation.description || ''}
        onChange={handleInputChange}
        placeholder="Experiment Description"
        required
      />
      <Select 
        onValueChange={(value) => handleInputChange({ target: { name: 'objective', value } } as React.ChangeEvent<HTMLSelectElement>)}
        value={adCreation.objective}
      >
        <SelectTrigger>
          <SelectValue placeholder="Campaign Objective" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="awareness">Brand Awareness</SelectItem>
          <SelectItem value="consideration">Consideration</SelectItem>
          <SelectItem value="conversion">Conversion</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}