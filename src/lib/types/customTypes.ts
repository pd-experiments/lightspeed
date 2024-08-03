export type ClipSearchResult = { // clip search results 
    id: string;
    title: string;
    video_id: string;
    video_uuid: string;
    text: string;
    description: string;
    start_timestamp: string;
    end_timestamp: string;
}; 

export type TranscriptItem = { // transcript item for a clip search result
    offset: number;
    text: string;
};