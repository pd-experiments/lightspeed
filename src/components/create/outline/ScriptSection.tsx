import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/create/television/[id]/page';
import TimeInput from '@/components/ui/time-input';
import { type ScriptElement, isScriptElement } from '@/lib/types/customTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2Icon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ScriptSectionProps {
  element: OutlineElementWithVideoTitle;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
}

const ScriptSection: React.FC<ScriptSectionProps> = ({
    element,
    setOutlineElements,
    outlineElements,
  }) => {
    const [scriptElements, setScriptElements] = useState<ScriptElement[]>([]);
    const [newStart, setNewStart] = useState(0);
    const [newEnd, setNewEnd] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
    const [history, setHistory] = useState<ScriptElement[][]>([]);

    useEffect(() => {
      const parsedScriptElements = parseScriptElements();
      setScriptElements(parsedScriptElements);
  
      const elementStart = new Date(element.position_start_time ?? '').getTime() / 1000;
      const elementEnd = new Date(element.position_end_time ?? '').getTime() / 1000;
  
      if (parsedScriptElements.length > 0) {
        const lastElement = parsedScriptElements[parsedScriptElements.length - 1];
        if (isScriptElement(lastElement) && lastElement) {
            setNewStart(lastElement.end);
            setNewEnd(Math.min(elementEnd, lastElement.end + 5));
        }
      } else {
        setNewStart(elementStart);
        setNewEnd(Math.min(elementEnd, elementStart + 5));
      }
    }, [element]);

    useEffect(() => {
      const handleUndo = (event: KeyboardEvent) => {
        if (event.metaKey && event.key === 'z') {
          event.preventDefault();
          undo();
        }
      };

      window.addEventListener('keydown', handleUndo);
      return () => {
        window.removeEventListener('keydown', handleUndo);
      };
    }, [history]);

    const parseScriptElements = (): ScriptElement[] => {
      if (element.script) {
        if (typeof element.script === 'string') {
          try {
            return JSON.parse(element.script);
          } catch (error) {
            console.error('Error parsing script JSON:', error);
          }
        } else if (Array.isArray(element.script)) {
          return element.script.filter(isScriptElement);
        }
      }
      return [];
    };

    const handleCreateScriptElement = (start: number, end: number) => {
      const newScriptElement = { start, end, text: '' };
      const updatedScriptElements = [...scriptElements, newScriptElement].sort((a, b) => a.start - b.start);
      updateScript(updatedScriptElements);
    };

    const handleUpdateScriptElement = (index: number, text: string) => {
      const updatedScriptElements = scriptElements.map((el, i) => (i === index ? { ...el, text } : el));
      updateScript(updatedScriptElements);
    };

    const updateScript = async (updatedScriptElements: ScriptElement[]) => {
      setHistory([...history, scriptElements]);
      setScriptElements(updatedScriptElements);
      setOutlineElements(outlineElements.map(el =>
        el.id === element.id ? { ...el, script: updatedScriptElements } : el
      ));
    
      try {
        const response = await fetch("/api/create/outlines/update-element", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: element.id, script: updatedScriptElements }),
        });
    
        if (!response.ok) {
          throw new Error("Failed to update script");
        }
      } catch (error) {
        console.error("Error updating script:", error);
      }
    };

    const handleGenerateScriptElementSuggestion = async (start: number, end: number, index: number) => {
        try {
          setIsGenerating(true);
          setGeneratingIndex(index);
          const response = await fetch("/api/create/outlines/generate-script-element-suggestion", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ outline_id: element.outline_id, element_id: element.id, script_element_start: start, script_element_end: end }),
          });
      
          if (!response.ok) {
            throw new Error("Failed to generate script element suggestion");
          }
      
          const { suggestion } = await response.json();
          console.log("Generated Suggestion:", suggestion);
          console.log("suggestion text:", suggestion.text);
      
          if (suggestion && suggestion.text) {
            const updatedScriptElements = scriptElements.map((el, i) => 
              i === index ? { ...el, text: suggestion.text } : el
            );
            updateScript(updatedScriptElements);
          } else {
            console.error("Unexpected suggestion format:", suggestion);
          }
        } catch (error) {
          console.error("Error generating script element suggestion:", error);
        } finally {
          setIsGenerating(false);
          setGeneratingIndex(null);
        }
    };

    const undo = useCallback(() => {
      if (history.length > 0) {
        const previousState = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setScriptElements(previousState);
        setOutlineElements(outlineElements.map(el =>
          el.id === element.id ? { ...el, script: previousState } : el
        ));
      }
    }, [history, outlineElements, setOutlineElements, element.id]);

    const calculateTotalScriptDuration = () => {
      return scriptElements.reduce((total, element) => total + (element?.end ?? 0) - (element?.start ?? 0), 0);
    };
    
    const elementDuration = (new Date(element.position_end_time ?? '').getTime() - new Date(element.position_start_time ?? '').getTime()) / 1000;
    const isScriptFull = calculateTotalScriptDuration() >= elementDuration;
  
    return (
      <div className="flex flex-col h-full p-2">
        <div className="flex-grow overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">⌘ + Z to undo edits!</label>
          </div>
          {scriptElements.map((scriptElement, index) => (
            <div key={index} className="p-2 flex items-start space-x-2 h-full max-h-24">
                <div className="flex-shrink-0 w-24 text-xs font-medium text-gray-600 flex flex-col h-full">
                    <div className="bg-gray-100 py-2 px-2 rounded-t flex-grow flex items-center justify-center">
                        {new Date(scriptElement.start * 1000).toISOString().slice(11, 19)}
                    </div>
                    <div className="bg-gray-100 py-2 px-2 rounded-b flex-grow flex items-center justify-center border-t border-gray-300">
                        {new Date(scriptElement.end * 1000).toISOString().slice(11, 19)}
                    </div>
                </div>
                {isGenerating && generatingIndex === index ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <Textarea
                      value={scriptElement.text}
                      onChange={(e) => handleUpdateScriptElement(index, e.target.value)}
                      className="flex-grow py-2 px-3 h-full ml-2"
                      placeholder="Ex. 'Hello, I'm John Doe. Today we're going to talk about the importance of..."
                  />
                )}
                <div className="flex flex-col items-center space-y-2 h-full">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                            const updatedScriptElements = scriptElements.filter((_, i) => i !== index);
                            updateScript(updatedScriptElements);
                        }}
                        className=" bg-red-100 hover:bg-red-200 w-full"
                    >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                        size="icon"
                        variant="default"
                        onClick={() => handleGenerateScriptElementSuggestion(scriptElement.start, scriptElement.end, index)}
                        className="w-full p-2"
                    >
                        Suggest
                    </Button>
                </div>
            </div>
          ))}
        {scriptElements.length === 0 && (
            <Card className="p-4 h-full">
                <CardContent className="flex items-center justify-center h-full py-3">
                <p className="text-base text-gray-500">There are no script elements for this section. Start creating your script!</p>
                </CardContent>
            </Card>
        )}
        </div>
        <div className="flex items-center py-2">
          <TimeInput
            value={new Date(newStart * 1000).toISOString().slice(11, 19)}
            onChange={(value) => {
              const time = value.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
              const elementStart = new Date(element.position_start_time ?? '').getTime() / 1000;
              const elementEnd = new Date(element.position_end_time ?? '').getTime() / 1000;
              setNewStart(Math.max(elementStart, Math.min(time, elementEnd)));
            }}
            min={new Date(element.position_start_time ?? '').getTime() / 1000}
            max={new Date(element.position_end_time ?? '').getTime() / 1000}
            className="mr-2"
          />
          <TimeInput
            value={new Date(newEnd * 1000).toISOString().slice(11, 19)}
            onChange={(value) => {
              const time = value.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
              const elementEnd = new Date(element.position_end_time ?? '').getTime() / 1000;
              setNewEnd(Math.min(time, elementEnd));
            }}
            min={new Date(element.position_start_time ?? '').getTime() / 1000}
            max={new Date(element.position_end_time ?? '').getTime() / 1000}
            className="mr-2"
          />
          <Button
            onClick={() => {
              if (newEnd > newStart && newEnd - newStart + calculateTotalScriptDuration() <= elementDuration) {
                handleCreateScriptElement(newStart, newEnd);
                const lastElement = scriptElements[scriptElements.length - 1];
                setNewStart(lastElement ? lastElement.end : newStart);
                setNewEnd(Math.min(newEnd + 5, new Date(element.position_end_time ?? '').getTime() / 1000));
              }
            }}
            className="ml-2 w-full"
            disabled={isScriptFull || newEnd <= newStart || newEnd - newStart + calculateTotalScriptDuration() > elementDuration}
          >
            Add Script Element
          </Button>
        </div>
      </div>
    );
  };

  export default ScriptSection;