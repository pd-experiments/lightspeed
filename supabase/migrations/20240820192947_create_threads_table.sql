CREATE TABLE public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id TEXT UNIQUE NOT NULL,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    likes INTEGER,
    replies INTEGER,
    reposts INTEGER,
    conversation_id TEXT,
    username TEXT,
    full_name TEXT,
    is_verified BOOLEAN,
    hashtag TEXT
);