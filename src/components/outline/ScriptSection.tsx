import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import TimeInput from '@/components/ui/time-input';
import { type ScriptElement, isScriptElement } from '@/lib/types/customTypes';

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
    
    useEffect(() => {
      const parsedScriptElements = parseScriptElements();
      setScriptElements(parsedScriptElements);
  
      const elementStart = new Date(element.position_start_time ?? '').getTime() / 1000;
      const elementEnd = new Date(element.position_end_time ?? '').getTime() / 1000;
  
      if (parsedScriptElements.length > 0) {
        const lastElement = parsedScriptElements[parsedScriptElements.length - 1];
        if (isScriptElement(lastElement) && lastElement) {
            setNewStart(lastElement.end);
            setNewEnd(Math.min(elementEnd, lastElement.end + 10));
        }
      } else {
        setNewStart(elementStart);
        setNewEnd(Math.min(elementEnd, elementStart + 10));
      }
    }, [element]);
  
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
      setScriptElements(updatedScriptElements);
      setOutlineElements(outlineElements.map(el =>
        el.id === element.id ? { ...el, script: updatedScriptElements } : el
      ));
    
      try {
        const response = await fetch("/api/outlines/update-element", {
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
  
    const calculateTotalScriptDuration = () => {
      return scriptElements.reduce((total, element) => total + (element?.end ?? 0) - (element?.start ?? 0), 0);
    };
    
    const elementDuration = (new Date(element.position_end_time ?? '').getTime() - new Date(element.position_start_time ?? '').getTime()) / 1000;
    const isScriptFull = calculateTotalScriptDuration() >= elementDuration;
  
    return (
      <div className="flex flex-col h-full p-2">
        <div className="flex-grow overflow-y-auto">
          {scriptElements.map((scriptElement, index) => (
            <div key={index} className="p-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">
                  {new Date(scriptElement.start * 1000).toISOString().slice(11, 19)} - 
                  {new Date(scriptElement.end * 1000).toISOString().slice(11, 19)}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    const updatedScriptElements = scriptElements.filter((_, i) => i !== index);
                    updateScript(updatedScriptElements);
                  }}
                >
                  Delete
                </Button>
              </div>
              <Textarea
                value={scriptElement.text}
                onChange={(e) => handleUpdateScriptElement(index, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
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
                setNewEnd(Math.min(newEnd + 10, new Date(element.position_end_time ?? '').getTime() / 1000));
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