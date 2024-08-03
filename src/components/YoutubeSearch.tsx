import React from 'react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import TranscriptViewer from '@/components/transcript/TranscriptViewer';
import SearchInput from '@/components/ui/SearchInput';
import { TranscriptItem } from '@/lib/types/customTypes';

interface YouTubeSearchTabProps {
  currentVideoId: string;
  selectedTranscript: TranscriptItem[];
  currentTimestamp: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  debouncedSearch: (query: string) => void;
  handleProgress: (state: { playedSeconds: number }) => void;
  playerRef: React.RefObject<any>;
}

const YouTubeSearchTab: React.FC<YouTubeSearchTabProps> = ({
  currentVideoId,
  selectedTranscript,
  currentTimestamp,
  searchQuery,
  setSearchQuery,
  isSearching,
  debouncedSearch,
  handleProgress,
  playerRef,
}) => {
  return (
    <div className="mt-10 mb-4 flex">
      <div className="w-1/2 mr-4">
        <VideoPlayer
          videoId={currentVideoId}
          onProgress={handleProgress}
          ref={playerRef}
        />
      </div>
      <div className="w-1/2">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={() => debouncedSearch(searchQuery)}
          placeholder="Take me to..."
        />
        {isSearching && (
          <p className="text-sm text-gray-500">Searching...</p>
        )}
        <TranscriptViewer
          transcript={selectedTranscript}
          currentTimestamp={currentTimestamp}
          onSeek={(offset) => {
            if (playerRef.current) {
              playerRef.current.seekTo(offset, "seconds");
            }
          }}
        />
      </div>
    </div>
  );
};

export default YouTubeSearchTab;