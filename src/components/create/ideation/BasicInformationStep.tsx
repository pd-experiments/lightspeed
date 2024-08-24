import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdExperimentInsert } from '@/lib/types/customTypes';

interface BasicInformationStepProps {
  adExperiment: AdExperimentInsert;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function BasicInformationStep({ adExperiment, handleInputChange }: BasicInformationStepProps) {
  return (
    <div className="space-y-4">
      <Input
        name="title"
        value={adExperiment.title}
        onChange={handleInputChange}
        placeholder="Experiment Title"
        required
      />
      <Textarea
        name="description"
        value={adExperiment.description || ''}
        onChange={handleInputChange}
        placeholder="Experiment Description"
        required
      />
      <Select 
        onValueChange={(value) => handleInputChange({ target: { name: 'objective', value } } as React.ChangeEvent<HTMLSelectElement>)}
        value={adExperiment.objective}
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