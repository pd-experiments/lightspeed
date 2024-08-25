import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdCreationInsert } from '@/lib/types/customTypes';

interface TargetAudienceStepProps {
  adCreation: AdCreationInsert;
  handleNestedInputChange: (category: 'target_audience', name: string, value: any) => void;
}

export default function TargetAudienceStep({ adCreation, handleNestedInputChange }: TargetAudienceStepProps) {
  return (
    <div className="space-y-4">
      <Select 
        onValueChange={(value) => handleNestedInputChange('target_audience', 'age', value.split(','))}
        value={adCreation.target_audience?.age?.join(',') || ''}
      >
        <SelectTrigger>
          <SelectValue placeholder="Age Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="18-24,25-34,35-44">18-44</SelectItem>
          <SelectItem value="45-54,55+">45+</SelectItem>
          <SelectItem value="18-24,25-34,35-44,45-54,55+">All Ages</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        onValueChange={(value) => handleNestedInputChange('target_audience', 'gender', value.split(','))}
        value={adCreation.target_audience?.gender?.join(',') || ''}
      >
        <SelectTrigger>
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male,female,other">All Genders</SelectItem>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Input
        name="interests"
        value={adCreation.target_audience?.interests?.join(', ') || ''}
        onChange={(e) => handleNestedInputChange('target_audience', 'interests', e.target.value.split(', '))}
        placeholder="Interests (comma-separated)"
      />
      <Input
        name="location"
        value={adCreation.target_audience?.location || ''}
        onChange={(e) => handleNestedInputChange('target_audience', 'location', e.target.value)}
        placeholder="Location"
      />
    </div>
  );
}