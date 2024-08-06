import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Link from 'next/link';

interface OutlineActionsProps {
  onPlay: () => void;
  onExport: () => void;
  onGenerateAIOrdering: () => void;
  onGenerateFullScript: () => void;
  scriptGenerationProgress: number;
}

export function OutlineActions({ onPlay, onExport, onGenerateAIOrdering, onGenerateFullScript, scriptGenerationProgress }: OutlineActionsProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2 mb-3">
        <Button size="sm" variant="default" className="w-full" onClick={onPlay}>Play</Button>
        <Button size="sm" variant="outline" className="w-full" onClick={onExport}>Export FCPXML</Button>
        <Button size="sm" variant="outline" className="w-full" onClick={onGenerateAIOrdering}>Generate AI Suggestions</Button>
        {/* <Button size="sm" variant="outline" className="w-full">Request Approval</Button> */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onGenerateFullScript} 
          className="w-full"
          disabled={scriptGenerationProgress > 0 && scriptGenerationProgress < 100}
        >
          {scriptGenerationProgress > 0 ? (
            scriptGenerationProgress < 100 ? (
            <div className="flex items-center justify-center">
              <CircularProgressbar
                value={scriptGenerationProgress}
                text={`${scriptGenerationProgress}%`}
                styles={{
                  root: { width: '24px', height: '24px', marginRight: '8px' },
                  path: { stroke: 'currentColor' },
                  text: { fill: 'currentColor', fontSize: '24px' },
                }}
              />
              <span className="text-blue-500">Generating...</span>
            </div>
            ) : (
              <span className="text-blue-500">Regenerate Full Script</span>
            )
          ) : (
            'Generate Full Script'
          )}
        </Button>
      </div>
    </div>
  );
}