-- Create tiktok_videos table
CREATE TABLE public.tiktok_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id TEXT UNIQUE NOT NULL,
    author TEXT NOT NULL,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    likes INTEGER,
    comments_count INTEGER,
    shares INTEGER,
    views INTEGER,
    hashtag TEXT,
    is_trending BOOLEAN
);

-- Create tiktok_comments table
CREATE TABLE public.tiktok_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id TEXT UNIQUE NOT NULL,
    video_id TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    likes INTEGER,
    FOREIGN KEY (video_id) REFERENCES public.tiktok_videos(video_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_tiktok_videos_hashtag ON public.tiktok_videos(hashtag);
CREATE INDEX idx_tiktok_videos_is_trending ON public.tiktok_videos(is_trending);
CREATE INDEX idx_tiktok_comments_video_id ON public.tiktok_comments(video_id);