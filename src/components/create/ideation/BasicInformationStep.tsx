import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdCreationInsert } from '@/lib/types/customTypes';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Type, FileText, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BasicInformationStepProps {
  adCreation: AdCreationInsert;
  onUpdate: (field: string, value: any) => void;
}

export default function BasicInformationStep({ adCreation, onUpdate }: BasicInformationStepProps) {
  const [localBasicInfo, setLocalBasicInfo] = useState({
    title: adCreation.title || '',
    description: adCreation.description || '',
    objective: adCreation.objective || '',
  });

  useEffect(() => {
    setLocalBasicInfo({
      title: adCreation.title || '',
      description: adCreation.description || '',
      objective: adCreation.objective || '',
    });
  }, [adCreation]);

  const handleInputChange = (field: string, value: string) => {
    setLocalBasicInfo(prev => ({ ...prev, [field]: value }));
    onUpdate(field, value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="title" className="flex items-center text-lg font-medium text-gray-700">
          <Type className="w-6 h-6 mr-3" />
          Experiment Title
        </label>
        <Input
          id="title"
          name="title"
          value={localBasicInfo.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter a concise title for your experiment"
          required
          className="w-full text-lg py-3"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="description" className="flex items-center text-lg font-medium text-gray-700">
          <FileText className="w-6 h-6 mr-3" />
          Experiment Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={localBasicInfo.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a brief description of your experiment"
          required
          className="w-full h-32 text-lg py-3"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="objective" className="flex items-center text-lg font-medium text-gray-700">
          <Target className="w-6 h-6 mr-3" />
          Campaign Objective
        </label>
        <Select 
          onValueChange={(value) => handleInputChange('objective', value)}
          value={localBasicInfo.objective}
        >
          <SelectTrigger id="objective" className="w-full text-lg py-3">
            <SelectValue placeholder="Select campaign objective" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="awareness" className="text-lg">Brand Awareness</SelectItem>
            <SelectItem value="consideration" className="text-lg">Consideration</SelectItem>
            <SelectItem value="conversion" className="text-lg">Conversion</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}