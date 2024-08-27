import { Input } from '@/components/ui/input';
import { AdCreationInsert } from '@/lib/types/customTypes';
import { Calendar, Users, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface TargetAudienceStepProps {
  adCreation: AdCreationInsert;
  onUpdate: (field: string, value: any) => void;
}

const ageRanges = ['18-24', '25-39', '40-54', '55+', 'All Ages'];
const genders = ['All Genders', 'Male', 'Female', 'Other'];

interface TargetAudience {
  age?: string[];
  gender?: string[];
  interests?: string[];
  location?: string;
}

export default function TargetAudienceStep({ adCreation, onUpdate }: TargetAudienceStepProps) {
  const [localTargetAudience, setLocalTargetAudience] = useState<TargetAudience>(adCreation.target_audience || {});

  useEffect(() => {
    setLocalTargetAudience(adCreation.target_audience || {});
  }, [adCreation.target_audience]);

  const handleTargetAudienceChange = (name: string, value: any) => {
    const updatedTargetAudience = { ...localTargetAudience, [name]: value };
    setLocalTargetAudience(updatedTargetAudience);
    onUpdate('target_audience', updatedTargetAudience);
  };

  const getAgeValue = (range: string) => {
    switch (range) {
      case '18-24': return ['18-24'];
      case '25-39': return ['25-34'];
      case '40-54': return ['35-44', '45-54'];
      case '55+': return ['55+'];
      case 'All Ages': return ['18-24', '25-34', '35-44', '45-54', '55+'];
      default: return [];
    }
  };

  const getGenderValue = (gender: string) => {
    return gender === 'All Genders' ? ['male', 'female', 'other'] : [gender.toLowerCase()];
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="flex items-center text-lg font-medium text-gray-700 mb-3">
          <Calendar className="w-6 h-6 mr-3" />
          Age Range
        </label>
        <div className="flex flex-wrap gap-3">
          {ageRanges.map(range => (
            <Button
              key={range}
              variant={localTargetAudience.age?.join(',') === getAgeValue(range).join(',') ? "default" : "outline"}
              size="lg"
              onClick={() => handleTargetAudienceChange('age', getAgeValue(range))}
              className="text-lg"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center text-lg font-medium text-gray-700 mb-3">
          <Users className="w-6 h-6 mr-3" />
          Gender
        </label>
        <div className="flex flex-wrap gap-3">
          {genders.map(gender => (
            <Button
              key={gender}
              variant={localTargetAudience.gender?.join(',') === getGenderValue(gender).join(',') ? "default" : "outline"}
              size="lg"
              onClick={() => handleTargetAudienceChange('gender', getGenderValue(gender))}
              className="text-lg"
            >
              {gender}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="interests" className="flex items-center text-lg font-medium text-gray-700 mb-3">
          <Heart className="w-6 h-6 mr-3" />
          Interests
        </label>
        <Input
          id="interests"
          name="interests"
          value={localTargetAudience.interests?.join(', ') || ''}
          onChange={(e) => handleTargetAudienceChange('interests', e.target.value.split(', ').filter(Boolean))}
          placeholder="e.g., Politics, Environment, Education"
          className="w-full text-lg py-3"
        />
      </div>

      <div>
        <label htmlFor="location" className="flex items-center text-lg font-medium text-gray-700 mb-3">
          <MapPin className="w-6 h-6 mr-3" />
          Location
        </label>
        <Input
          id="location"
          name="location"
          value={localTargetAudience.location || ''}
          onChange={(e) => handleTargetAudienceChange('location', e.target.value)}
          placeholder="e.g., New York City, NY"
          className="w-full text-lg py-3"
        />
      </div>
    </div>
  );
}