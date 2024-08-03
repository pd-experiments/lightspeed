import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import ReactPlayer from 'react-player';
import { OutlineElementWithVideoTitle } from '@/app/outline/page';
import DescriptionSection from './DescriptionSection';
import InstructionsSection from './InstructionsSection';
import SourcesSection from './SourcesSection';
import ScriptSection from './ScriptSection';

interface ElementCardProps {
  element: OutlineElementWithVideoTitle;
  handleDeleteElement: (elementId: string) => void;
  setOutlineElements: (elements: OutlineElementWithVideoTitle[]) => void;
  outlineElements: OutlineElementWithVideoTitle[];
  handleGenerateSuggestion: (elementId: string, type: 'instruction' | 'description' | 'sources') => Promise<void>;
  loadingStates: Record<string, boolean>;
}

const ElementCard: React.FC<ElementCardProps> = ({
  element,
  handleDeleteElement,
  setOutlineElements,
  outlineElements,
  handleGenerateSuggestion,
  loadingStates,
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
            isLoading={loadingStates[`${element.id}-description`]}
          />
        </CardContent>
      </Card>
      <Card className="flex-[3]">
        <CardContent className="p-2 h-full flex flex-col">
          <Tabs defaultValue="instructions" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden">
              <TabsContent value="instructions" className="h-full">
                <InstructionsSection
                  element={element}
                  setOutlineElements={setOutlineElements}
                  outlineElements={outlineElements}
                  handleGenerateSuggestion={handleGenerateSuggestion}
                  isLoading={loadingStates[`${element.id}-instruction`]}
                />
              </TabsContent>
              <TabsContent value="sources" className="h-full">
                <SourcesSection
                  element={element}
                  setOutlineElements={setOutlineElements}
                  outlineElements={outlineElements}
                  handleGenerateSuggestion={handleGenerateSuggestion}
                  isLoading={loadingStates[`${element.id}-sources`]}
                />
              </TabsContent>
              <TabsContent value="script" className="h-full">
                <ScriptSection
                  element={element}
                  setOutlineElements={setOutlineElements}
                  outlineElements={outlineElements}
                  // handleGenerateSuggestion={handleGenerateSuggestion}
                  // isLoading={loadingStates[`${element.id}-script`]}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementCard;