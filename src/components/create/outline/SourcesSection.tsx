import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/create/outline/[id]/page';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SourcesSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instructions' | 'description' | 'sources') => Promise<void>;
  isLoading: boolean;
}

const SourcesSection: React.FC<SourcesSectionProps> = ({
  element,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
  isLoading,
}) => {
  const handleSourcesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSources = e.target.value;
    setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, sources: newSources } : el));
    
    try {
      const response = await fetch("/api/create/outlines/update-element", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: element.id, sources: newSources }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sources");
      }
    } catch (error) {
      console.error("Error updating sources:", error);
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">Sources</label>
      </div>
      <div className="flex-grow flex flex-col">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <Textarea
            className="flex-grow resize-none"
            value={element.sources || ''}
            onChange={handleSourcesChange}
            placeholder="Include sources to reference in your notes here..."
          />
        )}
      </div>
      <div className="flex justify-end py-2">
        <Button size="sm" onClick={() => handleGenerateSuggestion(element.id, 'sources')}>
          Suggest
        </Button>
      </div>
    </div>
  );
};

export default SourcesSection;