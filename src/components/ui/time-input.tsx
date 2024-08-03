import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, min, max, className }) => {
  const adjustTime = (adjustment: number) => {
    const currentTime = value.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    const newTime = Math.max(min, Math.min(currentTime + adjustment, max));
    const newDate = new Date(newTime * 1000);
    onChange(newDate.toISOString().substr(11, 8));
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 text-center"
      />
      <div className="flex flex-col ml-1">
        <Button
          size="sm"
          variant="outline"
          className="p-0 h-full"
          onClick={() => adjustTime(1)}
        >
          <ChevronUp className="h-4 w-4 text-gray-500" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="p-0 h-full mt-1"
          onClick={() => adjustTime(-1)}
        >
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};

export default TimeInput;