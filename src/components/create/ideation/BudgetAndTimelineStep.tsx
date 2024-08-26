import { Input } from '@/components/ui/input';
import { AdCreationInsert } from '@/lib/types/customTypes';
import { DollarSign, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BudgetAndTimelineStepProps {
  adCreation: AdCreationInsert;
  onUpdate: (field: string, value: any) => void;
}

export default function BudgetAndTimelineStep({ adCreation, onUpdate }: BudgetAndTimelineStepProps) {
  const [localBudgetAndTimeline, setLocalBudgetAndTimeline] = useState({
    budget: adCreation.budget || '',
    duration: adCreation.duration || '',
    start_date: adCreation.start_date?.split('T')[0] || '',
    end_date: adCreation.end_date?.split('T')[0] || '',
  });

  useEffect(() => {
    setLocalBudgetAndTimeline({
      budget: adCreation.budget || '',
      duration: adCreation.duration || '',
      start_date: adCreation.start_date?.split('T')[0] || '',
      end_date: adCreation.end_date?.split('T')[0] || '',
    });
  }, [adCreation]);

  const handleInputChange = (field: string, value: any) => {
    const updatedValue = field === 'budget' || field === 'duration' ? Number(value) : value;
    setLocalBudgetAndTimeline(prev => ({ ...prev, [field]: updatedValue }));
    onUpdate(field, updatedValue);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="budget" className="flex items-center text-lg font-medium text-gray-700">
          <DollarSign className="w-6 h-6 mr-3" />
          Budget
        </label>
        <Input
          id="budget"
          type="number"
          name="budget"
          value={localBudgetAndTimeline.budget}
          onChange={(e) => handleInputChange('budget', e.target.value)}
          placeholder="Enter campaign budget"
          required
          className="w-full text-lg py-3"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="duration" className="flex items-center text-lg font-medium text-gray-700">
          <Clock className="w-6 h-6 mr-3" />
          Duration
        </label>
        <Input
          id="duration"
          type="number"
          name="duration"
          value={localBudgetAndTimeline.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
          placeholder="Enter campaign duration in days"
          required
          className="w-full text-lg py-3"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="start_date" className="flex items-center text-lg font-medium text-gray-700">
          <Calendar className="w-6 h-6 mr-3" />
          Start Date
        </label>
        <Input
          id="start_date"
          type="date"
          name="start_date"
          value={localBudgetAndTimeline.start_date}
          onChange={(e) => handleInputChange('start_date', e.target.value)}
          required
          className="w-full text-lg py-3"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="end_date" className="flex items-center text-lg font-medium text-gray-700">
          <Calendar className="w-6 h-6 mr-3" />
          End Date
        </label>
        <Input
          id="end_date"
          type="date"
          name="end_date"
          value={localBudgetAndTimeline.end_date}
          onChange={(e) => handleInputChange('end_date', e.target.value)}
          required
          className="w-full text-lg py-3"
        />
      </div>
    </div>
  );
}