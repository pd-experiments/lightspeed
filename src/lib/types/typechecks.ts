import { Database } from '@/lib/types/schema';

type Thread = Database['public']['Tables']['threads']['Row'];
type TikTokVideo = Database['public']['Tables']['tiktok_videos']['Row'];
type NewsArticle = Database['public']['Tables']['int_news']['Row'];

export function isThread(ref: Thread | TikTokVideo | NewsArticle): ref is Thread {
  return 'thread_id' in ref;
}

export function isTikTokVideo(ref: Thread | TikTokVideo | NewsArticle): ref is TikTokVideo {
  return 'views' in ref && 'hashtag' in ref && 'video_url' in ref;
}

export function isNewsArticle(ref: Thread | TikTokVideo | NewsArticle): ref is NewsArticle {
  return 'summary' in ref;
}