-- Drop the existing function
DROP FUNCTION IF EXISTS match_documents_grouped(vector(1536), float, int);

-- Recreate the function with the updated definition
CREATE OR REPLACE FUNCTION match_documents_grouped(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
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
    string_agg(ve.text, ' ') AS text,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM video_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  GROUP BY ve.video_uuid, ve."timestamp", ve.embedding
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;