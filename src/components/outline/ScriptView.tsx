import React, { useEffect } from 'react';
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import { v4 as uuidv4 } from 'uuid';
import ElementCard from './ElementCard';
import TimestampDivider from './TimestampDivider';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from 'react';

interface ScriptViewProps {
  outlineElements: OutlineElementWithVideoTitle[];
  handleDeleteElement: (elementId: string) => void;
  outline_id: string | null;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
}

interface TransitionElement {
  id: string;
  description: string;
  instructions: string;
  sources: string;
  position_start_time: string;
  position_end_time: string;
}

const ScriptView: React.FC<ScriptViewProps> = ({ outlineElements, handleDeleteElement, outline_id, setOutlineElements }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const combinedElements: OutlineElementWithVideoTitle[] = [
        ...outlineElements,
    ].sort((a, b) => new Date(a.position_start_time ?? '').getTime() - new Date(b.position_start_time ?? '').getTime());
    
    if (JSON.stringify(combinedElements) !== JSON.stringify(outlineElements)) {
        setOutlineElements(combinedElements);
    }
  }, [outlineElements]);

  const handleAddTransition = async (index: number) => {
    const previousElement = outlineElements[index - 1];
    const previousEndTime = previousElement ? new Date(previousElement.position_end_time ?? 0).getTime() : 0;
    const transitionStartTime = new Date(previousEndTime).toISOString();
    const transitionEndTime = new Date(previousEndTime + 30000).toISOString();
  
    const newTransition: TransitionElement = {
      id: uuidv4(),
      description: '',
      instructions: '',
      sources: '',
      position_start_time: transitionStartTime,
      position_end_time: transitionEndTime,
    };
  
    const element = {
      outline_id,
      video_uuid: null,
      video_id: null,
      video_start_time: null,
      video_end_time: null,
      position_start_time: transitionStartTime,
      position_end_time: transitionEndTime,
      type: 'TRANSITION',
      description: newTransition.description,
    };
  
    try {
      const response = await fetch("/api/outlines/create-element", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(element),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add transition to outline");
      }
  
      const updatedElements = outlineElements.map((el, idx) => {
        if (idx >= index) {
          const newStartTime = new Date(new Date(el.position_start_time ?? '').getTime() + 30000).toISOString();
          const newEndTime = new Date(new Date(el.position_end_time ?? '').getTime() + 30000).toISOString();
          return { ...el, position_start_time: newStartTime, position_end_time: newEndTime };
        }
        return el;
      });

      const updateElementsFormat = updatedElements.map((element) => ({
        id: element.id,
        outline_id: element.outline_id,
        video_uuid: element.video_uuid,
        video_id: element.video_id,
        video_start_time: element.video_start_time,
        video_end_time: element.video_end_time,
        position_start_time: element.position_start_time,
        position_end_time: element.position_end_time,
        type: element.type,
        description: element.description,
      }));

      const updateResponse = await fetch("/api/outlines/update-elements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ elements: updateElementsFormat }),
      });
  
      if (!updateResponse.ok) {
        throw new Error("Failed to update outline elements");
      }
  
      setOutlineElements(updatedElements);
  
      alert("Transition added to outline successfully.");
    } catch (error) {
      console.error("Error adding transition to outline:", error);
      alert("Error adding transition to outline.");
    }
  };

  const handleGenerateSuggestion = async (elementId: string, type: 'instruction' | 'description' | 'sources') => {
    try {
      setLoadingStates(prev => ({ ...prev, [`${elementId}-${type}`]: true }));
      const response = await fetch(`/api/outlines/generate-${type}-suggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outline_id, element_id: elementId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type} suggestion`);
      }

      const { suggestion } = await response.json();

      setOutlineElements(outlineElements.map((el) => 
        el.id === elementId ? { ...el, [type]: suggestion } : el
      ));

      const updateResponse = await fetch("/api/outlines/update-element", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: elementId, [type]: suggestion }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to save ${type} suggestion`);
      }
    } catch (error) {
      console.error(`Error generating ${type} suggestion:`, error);
      alert(`Error generating ${type} suggestion.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`${elementId}-${type}`]: false }));
    }
  };

  return (
    <div className="p-0">
      {outlineElements.map((element, index) => {
        const currentTime = element ? new Date(element.position_end_time ?? '').toISOString().slice(11, 19) : '00:00:00';

        return (
          <div key={element.id}>
            <ElementCard
              element={element}
              handleDeleteElement={handleDeleteElement}
              setOutlineElements={setOutlineElements}
              outlineElements={outlineElements}
              handleGenerateSuggestion={handleGenerateSuggestion}
              loadingStates={loadingStates}
            />
            <TimestampDivider
              currentTime={currentTime}
              onAddTransition={() => handleAddTransition(index + 1)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ScriptView;