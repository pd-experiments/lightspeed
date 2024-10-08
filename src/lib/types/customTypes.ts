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

export type AdContent = {
    headline?: string;
    body?: string;
    callToAction?: string;
    image?: File | null;
  }

export type TargetAudience = {
    location?: string;
    age?: string [];
    gender?: string [];
    interests?: string [];
  }

  export type AdVersion = {
    id: string;
    platform: Platform;
    textContent: string;
    images?: string[];
    image?: string;
    videoDescription?: string;
    inVideoScript?: string;
    hashtags: string[];
    link?: string;
    adsetId?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  
  export type Platform = 'Facebook' | 'Instagram Post' | 'Instagram Story' | 'Instagram Reel' | 'TikTok' | 'Threads';
  
  export type VersionData = {
    versions: AdVersion[];
    config: {
      platforms: Platform[];
      toneOfVoice: string;
      creativityLevel: number;
      targetAudience: string;
      keyMessage: string;
      numVersions: number;
    };
  };

export type AdCreationInsert = Database['public']['Tables']['ad_creations']['Insert'] & {
    ad_content: AdContent;
    target_audience: TargetAudience;
    version_data?: VersionData;
  };

export type AdCreation = Database['public']['Tables']['ad_creations']['Row'] & {
    ad_content: AdContent;
    target_audience: TargetAudience;
    version_data?: VersionData;
  };

export type TikTok = Database['public']['Tables']['tiktok_videos']['Row'];
export type Threads = Database['public']['Tables']['threads']['Row'];
export type News = Database['public']['Tables']['int_news']['Row'];
export type Ads = Database['public']['Tables']['int_ads__google_ads_enhanced']['Row'];



export type AdMetrics = {
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency: number;
};

export type AdDemographics = {
  ageGenderBreakdown: {
    [key: string]: {
      impressions: string;
      clicks: string;
      spend: string;
    };
  };
};

export type AdComment = {
  from: {
    name: string;
  };
  message: string;
  created_time: string;
};

export type AdTimeSeriesData = {
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
};

export type AdPerformanceData = {
  updated_at: string;
  metrics: AdMetrics;
  demographics: AdDemographics;
  comments: AdComment[];
  timeSeriesData: AdTimeSeriesData[];
};

export type CampaignInfo = {
  name: string;
  objective: string;
  id: string;
};

export type AdDeployment = Database['public']['Tables']['ad_deployments']['Row'] & {
  performance_data?: AdPerformanceData;
  campaign_info?: CampaignInfo;
};

export type AdTest = Database['public']['Tables']['ad_deployments']['Row'] & {
  performance_data?: AdPerformanceData;
  campaign_info?: CampaignInfo;
};

export type AdDeploymentWithCreation = AdDeployment & {
  creation: AdCreation;
};

export type HotIssue = {
  issue: string;
  description: string;
  importance: number;
  keyPoints: string[];
  relatedTopics: string[];
  trendDirection: 'rising' | 'stable' | 'declining';
  impactAreas: string[];
};

export type PoliticalLeaning = {
  leaning: string;
  count: number;
};