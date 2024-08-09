CREATE TABLE compliance_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT,
    text TEXT,
    embeddings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);