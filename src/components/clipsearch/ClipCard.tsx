import React from 'react';
import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactPlayer from 'react-player';
import { ClipSearchResult } from '@/lib/types/customTypes';

interface ClipCardProps {
  item: ClipSearchResult;
  showMore: boolean;
  onShowMore: () => void;
  onAddToOutline: () => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ item, showMore, onShowMore, onAddToOutline }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardDescription className="text-gray-800 font-semibold">
          {item.title}
        </CardDescription>
        <CardDescription>
          {new Date(item.start_timestamp).toISOString().slice(11, 19)} -{' '}
          {new Date(item.end_timestamp).toISOString().slice(11, 19)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${item.video_id}`}
          controls
          playing={true}
          volume={0}
          width="100%"
          height="100%"
          config={{
            youtube: {
              playerVars: {
                start: new Date(item.start_timestamp).getTime() / 1000,
                end: new Date(item.end_timestamp).getTime() / 1000,
              },
            },
          }}
        />
        <div className="p-2">
          <CardDescription className="mt-3 pr-2 break-words">
            {showMore ? (
              <>
                {item.description}
                <button
                  onClick={onShowMore}
                  className="text-blue-600 hover:underline ml-2"
                >
                  Show less
                </button>
              </>
            ) : (
              <>
                {item.description.slice(0, 200)}...
                <button
                  onClick={onShowMore}
                  className="text-blue-600 hover:underline ml-2"
                >
                  Show more
                </button>
              </>
            )}
          </CardDescription>
        </div>
        <Button className="w-full" onClick={onAddToOutline}>
          Add to Outline
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClipCard;