import { useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  playerRef: React.RefObject<ReactPlayer>;
}

export function VideoPlayer({ videoId, playerRef }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="link" className="text-blue-500 hover:text-blue-700 mb-3">
          {isOpen ? (
            <>
              Hide Video <ChevronUpIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Video <ChevronDownIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mb-6 rounded-md overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          controls
          width="100%"
          height="600px"
          className="rounded-lg"
        />
      </CollapsibleContent>
    </Collapsible>
  );
}