import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import { Skeleton } from "@/components/ui/skeleton";

interface InstructionsSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instruction' | 'description' | 'sources') => Promise<void>;
  isLoading: boolean;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  element,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
  isLoading,
}) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Instructions</label>
      <div className="flex items-center">
        {isLoading ? (
          <Skeleton className="w-full h-40" />
        ) : (
          <Textarea
            className="mt-1 min-h-40 flex-grow"
            value={element.instructions || ''}
            onChange={(e) => {
              setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, instructions: e.target.value } : el));
            }}
          />
        )}
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