import { Database } from "@/lib/types/schema";

type OutlineStatus = Database["public"]["Tables"]["outline"]["Row"]["status"];

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

export const OutlineStatusEnum: { [key: string]: OutlineStatus } = {
    INITIALIZED: "INITIALIZED",
    EDITING: "EDITING",
    GENERATING: "GENERATING",
    SCRIPT_FINALIZED: "SCRIPT_FINALIZED",
    COMPLIANCE_CHECK: "COMPLIANCE_CHECK"
  };
  
export type AdExperimentInsert = Database['public']['Tables']['ad_experiments']['Insert'];