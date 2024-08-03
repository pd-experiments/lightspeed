import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import ReactPlayer from 'react-player';
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import DescriptionSection from './DescriptionSection';
import InstructionsSection from './InstructionsSection';
import SourcesSection from './SourcesSection';

interface ElementCardProps {
  element: OutlineElementWithVideoTitle;
  handleDeleteElement: (elementId: string) => void;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instruction' | 'description' | 'sources') => Promise<void>;
}

const ElementCard: React.FC<ElementCardProps> = ({
  element,
  handleDeleteElement,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
}) => {
  return (
    <div className="flex mb-4">
      <Card className="flex-[2] mr-4">
        <CardContent className="p-2 h-full flex flex-col">
          <div className="flex justify-between">
            <span className="text-blue-500 font-semibold break-words">
              {element.type === 'TRANSITION' ? 'Transition' : element.video_title}
            </span>
            <Button size="sm" variant="outline" className="hover:bg-red-50" onClick={() => handleDeleteElement(element.id)}>
              <Trash2Icon className="w-4 h-4 text-red-500"/>
            </Button>
          </div>
          {element.type !== 'TRANSITION' && (
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
          )}
          <DescriptionSection
            element={element}
            setOutlineElements={setOutlineElements}
            outlineElements={outlineElements}
            handleGenerateSuggestion={handleGenerateSuggestion}
          />
        </CardContent>
      </Card>
      <Card className="flex-[3]">
        <CardContent className="p-2 h-full flex flex-col">
          <InstructionsSection
            element={element}
            setOutlineElements={setOutlineElements}
            outlineElements={outlineElements}
            handleGenerateSuggestion={handleGenerateSuggestion}
          />
          <SourcesSection
            element={element}
            setOutlineElements={setOutlineElements}
            outlineElements={outlineElements}
            handleGenerateSuggestion={handleGenerateSuggestion}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementCard;