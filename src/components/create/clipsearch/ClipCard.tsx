import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipSearchResult } from '@/lib/types/customTypes';
import { PlayCircle, Plus } from 'lucide-react';

interface ClipCardProps {
  item: ClipSearchResult;
  showMore: boolean;
  onShowMore: () => void;
  onAddToOutline: () => void;
  disabled?: boolean;
}

const ClipCard: React.FC<ClipCardProps> = ({ item, showMore, onShowMore, onAddToOutline, disabled = false }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="aspect-video bg-gray-100 mb-3 relative rounded overflow-hidden">
          <img
            src={`https://img.youtube.com/vi/${item.video_id}/0.jpg`}
            alt={item.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white opacity-80" />
          </div>
        </div>
        <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 mb-2">
          {new Date(item.start_timestamp).toISOString().slice(11, 19)} -{' '}
          {new Date(item.end_timestamp).toISOString().slice(11, 19)}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          {showMore ? item.description : `${item.description.slice(0, 100)}...`}
          {item.description.length > 100 && (
            <button
              onClick={onShowMore}
              className="text-blue-600 hover:underline ml-1 text-xs"
            >
              {showMore ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>
        <Button 
          size="sm" 
          className="w-full" 
          onClick={onAddToOutline} 
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Outline
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClipCard;