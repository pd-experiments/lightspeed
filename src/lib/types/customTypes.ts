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

export type ScriptElement = { // script element for an outline element
    start: number;
    end: number;
    text: string;
};

// validators
export const isScriptElement = (item: any): item is ScriptElement => {
    return typeof item === 'object' && item !== null &&
      typeof item.start === 'number' &&
      typeof item.end === 'number' &&
      typeof item.text === 'string';
};