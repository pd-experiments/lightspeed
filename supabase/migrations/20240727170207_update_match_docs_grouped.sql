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
  start_timestamp timestamptz,
  end_timestamp timestamptz,
  text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_embeddings AS (
    SELECT
      ve.video_uuid,
      ve."timestamp",
      ve.text,
      1 - (ve.embedding <=> query_embedding) AS similarity,
      ROW_NUMBER() OVER (PARTITION BY ve.video_uuid ORDER BY ve."timestamp") AS row_num
    FROM video_embeddings ve
    WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  ),
  grouped_embeddings AS (
    SELECT
      ranked_embeddings.video_uuid,
      MIN(ranked_embeddings."timestamp") AS start_timestamp,
      MAX(ranked_embeddings."timestamp") AS end_timestamp,
      string_agg(ranked_embeddings.text, ' ') AS text,
      AVG(ranked_embeddings.similarity) AS similarity
    FROM ranked_embeddings
    GROUP BY ranked_embeddings.video_uuid, (ranked_embeddings.row_num - EXTRACT(EPOCH FROM ranked_embeddings."timestamp") / 60)
  )
  SELECT
    grouped_embeddings.video_uuid,
    grouped_embeddings.start_timestamp,
    grouped_embeddings.end_timestamp,
    grouped_embeddings.text,
    grouped_embeddings.similarity
  FROM grouped_embeddings
  ORDER BY grouped_embeddings.similarity DESC
  LIMIT match_count;
END;
$$;