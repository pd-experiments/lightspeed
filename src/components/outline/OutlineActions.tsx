import { Button } from '@/components/ui/button';

interface OutlineActionsProps {
  onPlay: () => void;
  onExport: () => void;
  onGenerateAIOrdering: () => void;
}

export function OutlineActions({ onPlay, onExport, onGenerateAIOrdering }: OutlineActionsProps) {
  return (
    <>
      <div className="mb-6 flex items-center space-x-2">
        <Button size="sm" className="w-full" onClick={onPlay}>Play</Button>
        <Button size="sm" variant="outline" className="w-full" onClick={onExport}>Export as Final Cut Pro XML</Button>
      </div>
      <div className="pt-2 pb-6">
        <Button size="sm" className="w-full border-blue-400 text-blue-500 hover:text-blue-400 hover:border-blue-300" variant="outline" onClick={onGenerateAIOrdering}>Generate AI Outline Suggestion(s)</Button>
      </div>
    </>
  );
}