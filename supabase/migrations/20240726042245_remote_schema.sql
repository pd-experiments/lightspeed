CREATE TABLE youtube (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    published_at TIMESTAMPTZ,
    transcript JSONB
);