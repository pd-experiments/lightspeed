import { Input } from '@/components/ui/input';
import { AdCreationInsert } from '@/lib/types/customTypes';

interface BudgetAndTimelineStepProps {
  adCreation: AdCreationInsert;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BudgetAndTimelineStep({ adCreation, handleInputChange }: BudgetAndTimelineStepProps) {
  return (
    <div className="space-y-4">
      <Input
        type="number"
        name="budget"
        value={adCreation.budget}
        onChange={handleInputChange}
        placeholder="Budget"
        required
      />
      <Input
        type="number"
        name="duration"
        value={adCreation.duration}
        onChange={handleInputChange}
        placeholder="Duration (days)"
        required
      />
      <Input
        type="date"
        name="start_date"
        value={adCreation.start_date.split('T')[0]}
        onChange={handleInputChange}
        required
      />
      <Input
        type="date"
        name="end_date"
        value={adCreation.end_date.split('T')[0]}
        onChange={handleInputChange}
        required
      />
    </div>
  );
}