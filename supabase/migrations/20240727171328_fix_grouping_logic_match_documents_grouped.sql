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
      sub.video_uuid,
      MIN(sub."timestamp") AS start_timestamp,
      MAX(sub."timestamp") AS end_timestamp,
      string_agg(sub.text, ' ') AS text,
      AVG(sub.similarity) AS similarity
    FROM (
      SELECT
        re.video_uuid,
        re."timestamp",
        re.text,
        re.similarity,
        re.row_num - ROW_NUMBER() OVER (PARTITION BY re.video_uuid ORDER BY re."timestamp") AS grp
      FROM ranked_embeddings re
    ) sub
    GROUP BY sub.video_uuid, sub.grp
  )
  SELECT
    ge.video_uuid,
    ge.start_timestamp,
    ge.end_timestamp,
    ge.text,
    ge.similarity
  FROM grouped_embeddings ge
  ORDER BY ge.similarity DESC
  LIMIT match_count;
END;
$$;