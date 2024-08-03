import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReactPlayer from 'react-player';
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import { v4 as uuidv4 } from 'uuid';

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

  const handleGenerateInstructionSuggestion = async (elementId: string) => {
    try {
      const response = await fetch("/api/outlines/generate-instruction-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outline_id, element_id: elementId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate instruction suggestion");
      }
  
      const { suggestion } = await response.json();
      setOutlineElements(outlineElements.map((el) => 
        el.id === elementId ? { ...el, instructions: suggestion } : el
      ));
    } catch (error) {
      console.error("Error generating instruction suggestion:", error);
      alert("Error generating instruction suggestion.");
    }
  };
  
  const handleGenerateDescriptionSuggestion = async (elementId: string) => {
    try {
      const response = await fetch("/api/outlines/generate-description-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outline_id, element_id: elementId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate description suggestion");
      }
  
      const { suggestion } = await response.json();
      setOutlineElements(outlineElements.map((el) => 
        el.id === elementId ? { ...el, description: suggestion } : el
      ));
    } catch (error) {
      console.error("Error generating description suggestion:", error);
      alert("Error generating description suggestion.");
    }
  };

  return (
    <div className="p-0">
      {outlineElements.map((element, index) => {
        const currentTime = element ? new Date(element.position_end_time ?? '').toISOString().slice(11, 19) : '00:00:00';

        return (
          <div key={element.id}>
            {element.type === 'TRANSITION' ? (
              <div className="flex mb-4">
                <Card className="flex-[2] mr-4">
                  <CardContent className="p-2 h-full flex flex-col">
                    <div className="flex justify-between">
                      <span className="text-blue-500 font-semibold break-words">Transition</span>
                      <Button size="sm" variant="outline" className="hover:bg-red-50" onClick={() => handleDeleteElement(element.id)}>
                        <Trash2Icon className="w-4 h-4 text-red-500"/>
                      </Button>
                    </div>
                    <div className="flex flex-col w-full py-1">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                        className="border mt-1 min-h-40 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm flex-grow"
                        rows={3}
                        value={element.description || ''}
                        onChange={(e) => {
                            setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, description: e.target.value } : el));
                        }}
                        />
                    </div>
                    <div className="text-xs text-right justify-end font-medium w-full text-gray-700">
                      <span>{new Date(element.position_start_time ?? '').toISOString().slice(11, 19)} - 
                        {new Date(element.position_end_time ?? '').toISOString().slice(11, 19)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex-[3]">
                  <CardContent className="p-2 h-full flex flex-col">
                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                      className="border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm flex-grow"
                      rows={3}
                      value={element.instructions || ''}
                      onChange={(e) => {
                        setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, instructions: e.target.value } : el));
                      }}
                    />
                    <label className="mt-2 block text-sm font-medium text-gray-700">Sources</label>
                    <textarea
                      className="border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm flex-grow"
                      rows={3}
                      value={element.sources || ''}
                      onChange={(e) => {
                        setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, sources: e.target.value } : el));
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex mb-4">
                <Card className="flex-[2] mr-4">
                    <CardContent className="p-2 h-full flex flex-col">
                    <div className="flex justify-between">
                        <span className="text-blue-500 font-semibold break-words">{element.video_title}</span>
                        <Button size="sm" variant="outline" className="hover:bg-red-50" onClick={() => handleDeleteElement(element.id)}>
                        <Trash2Icon className="w-4 h-4 text-red-500"/>
                        </Button>
                    </div>
                    <div className="relative my-2 rounded-md h-full">
                        <ReactPlayer
                        url={`https://www.youtube.com/watch?v=${element.video_id}`}
                        controls
                        width="100%"
                        height="100%"
                        className="rounded-lg"
                        config={{
                            youtube: {
                            playerVars: {
                                start: new Date(element.video_start_time ?? '').getTime() / 1000,
                                end: new Date(element.video_end_time ?? '').getTime() / 1000,
                            },
                            },
                        }}
                        />
                    </div>
                    <div className="text-xs text-right justify-end font-medium w-full text-gray-700">
                        <span>{new Date(element.position_start_time ?? '').toISOString().slice(11, 19)} - 
                        {new Date(element.position_end_time ?? '').toISOString().slice(11, 19)}
                        </span>
                    </div>
                    </CardContent>
                </Card>
                <Card className="flex-[3]">
                    <CardContent className="p-2 h-full flex flex-col">
                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                    <div className="flex items-center">
                        <textarea
                        className="border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm flex-grow"
                        rows={3}
                        value={element.instructions || ''}
                        onChange={(e) => {
                            setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, instructions: e.target.value } : el));
                        }}
                        />
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => handleGenerateInstructionSuggestion(element.id)}>
                        Suggest
                        </Button>
                    </div>
                    <label className="mt-2 block text-sm font-medium text-gray-700">Description</label>
                    <div className="flex items-center">
                        <textarea
                        className="border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm flex-grow"
                        rows={3}
                        value={element.description || ''}
                        onChange={(e) => {
                            setOutlineElements(outlineElements.map((el) => el.id === element.id ? { ...el, description: e.target.value } : el));
                        }}
                        />
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => handleGenerateDescriptionSuggestion(element.id)}>
                        Suggest
                        </Button>
                    </div>
                    </CardContent>
                </Card>
              </div>
            )}
            <div className="py-2 flex items-center">
              <div className="flex-1 h-[0.1rem] bg-gray-200" />
              <Badge className="ml-2 bg-gray-200 text-gray-700">{currentTime}</Badge>
              <Button size="sm" variant="outline" className="ml-2" onClick={() => handleAddTransition(index + 1)}>
                Add Transition
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScriptView;