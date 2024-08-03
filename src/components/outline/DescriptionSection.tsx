import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import { Skeleton } from "@/components/ui/skeleton";

interface DescriptionSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instruction' | 'description' | 'sources') => Promise<void>;
  isLoading: boolean;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  element,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
  isLoading,
}) => {
  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, description: newDescription } : el));
    
    try {
      const response = await fetch("/api/outlines/update-element", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: element.id, description: newDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to update description");
      }
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <span className="text-xs font-medium text-gray-700">
          {new Date(element.position_start_time ?? '').toISOString().slice(11, 19)} - 
          {new Date(element.position_end_time ?? '').toISOString().slice(11, 19)}
        </span>
      </div>
      <div className="flex-grow flex flex-col">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <Textarea
            className="flex-grow resize-none"
            value={element.description || ''}
            onChange={handleDescriptionChange}
          />
        )}
      </div>
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={() => handleGenerateSuggestion(element.id, 'description')}>
          Suggest
        </Button>
      </div>
    </div>
  );
};

export default DescriptionSection;