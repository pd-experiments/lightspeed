import { Input } from '@/components/ui/input';
import { AdExperimentInsert } from '@/lib/types/customTypes';

interface BudgetAndTimelineStepProps {
  adExperiment: AdExperimentInsert;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BudgetAndTimelineStep({ adExperiment, handleInputChange }: BudgetAndTimelineStepProps) {
  return (
    <div className="space-y-4">
      <Input
        type="number"
        name="budget"
        value={adExperiment.budget}
        onChange={handleInputChange}
        placeholder="Budget"
        required
      />
      <Input
        type="number"
        name="duration"
        value={adExperiment.duration}
        onChange={handleInputChange}
        placeholder="Duration (days)"
        required
      />
      <Input
        type="date"
        name="start_date"
        value={adExperiment.start_date.split('T')[0]}
        onChange={handleInputChange}
        required
      />
      <Input
        type="date"
        name="end_date"
        value={adExperiment.end_date.split('T')[0]}
        onChange={handleInputChange}
        required
      />
    </div>
  );
}