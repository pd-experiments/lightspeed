import React from 'react';
import { TranscriptItem } from '@/lib/types/customTypes';

interface TranscriptViewerProps {
  transcript: TranscriptItem[];
  currentTimestamp: number;
  onSeek: (offset: number) => void;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcript, currentTimestamp, onSeek }) => {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="text-sm text-gray-500 sticky top-0 bg-gray-100 p-4 font-semibold flex">
        <div className="w-1/4">Timestamp</div>
        <div className="w-3/4">Soundbite</div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {transcript.map((item, index) => (
          <div
            key={index}
            className={`flex items-start p-4 border-b border-gray-100 ${
              item.offset <= currentTimestamp &&
              (index === transcript.length - 1 ||
                transcript[index + 1].offset > currentTimestamp)
                ? "bg-blue-50"
                : ""
            }`}
          >
            <div
              className="w-1/4 text-sm font-medium text-gray-600 cursor-pointer"
              onClick={() => onSeek(item.offset)}
            >
              {new Date(item.offset * 1000).toISOString().slice(11, 19)}
            </div>
            <div className="w-3/4 text-gray-800 text-sm">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptViewer;