import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  videoId: string;
  onProgress: (state: { playedSeconds: number }) => void;
  ref: React.RefObject<ReactPlayer>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onProgress, ref }) => {
  return (
    <ReactPlayer
      ref={ref}
      url={`https://www.youtube.com/watch?v=${videoId}`}
      controls
      playing={true}
      width="100%"
      height="100%"
      style={{ borderRadius: "8px", overflow: "hidden" }}
      onProgress={onProgress}
    />
  );
};

export default VideoPlayer;