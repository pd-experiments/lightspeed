CREATE TABLE video_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_uuid UUID REFERENCES youtube(id),
    timestamp TIMESTAMPTZ,
    text TEXT,
    embedding vector(1536)
);