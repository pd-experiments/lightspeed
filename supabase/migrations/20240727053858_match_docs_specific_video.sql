-- Drop the existing function
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int);

-- Recreate the function with the updated definition
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  video_uuid_specific uuid
)
RETURNS TABLE (
  video_uuid uuid,
  "timestamp" timestamptz,
  text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.video_uuid,
    ve."timestamp",
    ve.text,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM video_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
    AND ve.video_uuid = video_uuid
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;