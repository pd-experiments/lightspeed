import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimestampDividerProps {
  currentTime: string;
  onAddTransition: () => void;
}

const TimestampDivider: React.FC<TimestampDividerProps> = ({ currentTime, onAddTransition }) => {
  return (
    <div className="py-2 flex items-center">
      <div className="flex-1 h-[0.1rem] bg-blue-400" />
      <Badge className="ml-2 bg-blue-500 text-white hover:bg-blue-400">{currentTime}</Badge>
      <Button size="sm" variant="outline" className="ml-2" onClick={onAddTransition}>
        Add Transition
      </Button>
    </div>
  );
};

export default TimestampDivider;