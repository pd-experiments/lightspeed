import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/outline/page';

interface InstructionsSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instruction' | 'description' | 'sources') => Promise<void>;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  element,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
}) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Instructions</label>
      <div className="flex items-center">
        <Textarea
          className="mt-1 min-h-40 flex-grow"
          value={element.instructions || ''}
          onChange={(e) => {
            setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, instructions: e.target.value } : el));
          }}
        />
      </div>
      <div className="flex justify-end p-2">
        <Button size="sm" className="ml-2" onClick={() => handleGenerateSuggestion(element.id, 'instruction')}>
          Suggest
        </Button>
      </div>
    </>
  );
};

export default InstructionsSection;