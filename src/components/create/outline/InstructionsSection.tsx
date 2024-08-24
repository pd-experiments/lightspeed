import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/create/ideation/television/[id]/page';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface InstructionsSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instructions' | 'description' | 'sources') => Promise<void>;
  isLoading: boolean;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  element,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
  isLoading,
}) => {
  const handleInstructionsChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInstructions = e.target.value;
    setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, instructions: newInstructions } : el));
    
    try {
      const response = await fetch("/api/create/outlines/update-element", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: element.id, instructions: newInstructions }),
      });

      if (!response.ok) {
        throw new Error("Failed to update instructions");
      }
    } catch (error) {
      console.error("Error updating instructions:", error);
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">Instructions</label>
      </div>
      <div className="flex-grow flex flex-col">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <Textarea
            className="flex-grow resize-none"
            value={element.instructions || ''}
            onChange={handleInstructionsChange}
            placeholder="Explain instructions for video production here..."
          />
        )}
      </div>
      <div className="flex justify-end py-2">
        <Button size="sm" onClick={() => handleGenerateSuggestion(element.id, 'instructions')}>
          Suggest
        </Button>
      </div>
    </div>
  );
};

export default InstructionsSection;