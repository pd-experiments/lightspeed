import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/outline/page';

interface DescriptionSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instruction' | 'description' | 'sources') => Promise<void>;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  element,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mt-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <span className="text-xs font-medium text-gray-700">
          {new Date(element.position_start_time ?? '').toISOString().slice(11, 19)} - 
          {new Date(element.position_end_time ?? '').toISOString().slice(11, 19)}
        </span>
      </div>
      <div className="flex-grow flex flex-col mt-2">
        <Textarea
          className="flex-grow resize-none"
          value={element.description || ''}
          onChange={(e) => {
            setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, description: e.target.value } : el));
          }}
        />
      </div>
      <div className="flex justify-end p-2">
        <Button size="sm" onClick={() => handleGenerateSuggestion(element.id, 'description')}>
          Suggest
        </Button>
      </div>
    </>
  );
};

export default DescriptionSection;