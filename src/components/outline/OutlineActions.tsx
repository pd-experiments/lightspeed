import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OutlineActionsProps {
  onPlay: () => void;
  onExport: () => void;
  onGenerateAIOrdering: () => void;
}

export function OutlineActions({ onPlay, onExport, onGenerateAIOrdering }: OutlineActionsProps) {
  return (
    <>
      <div className="mb-6 flex items-center space-x-2">
        <Button size="sm" variant="destructive" className="w-full">
          Request Approval
        </Button>
        <Button size="sm" className="w-full" onClick={onPlay}>Play</Button>
        <Button size="sm" variant="outline" className="w-full border border-gray-300" onClick={onExport}>Export as Final Cut Pro XML</Button>
        <Button size="sm" className="w-full border-blue-400 text-blue-500 hover:text-blue-400 hover:border-blue-300" variant="outline" onClick={onGenerateAIOrdering}>Generate AI Outline Suggestion(s)</Button>
      </div>
    </>
  );
}