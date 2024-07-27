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
  video_id text,
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
      ROW_NUMBER() OVER (PARTITION BY ve.video_uuid ORDER BY ve."timestamp") AS row_num,
      EXTRACT(EPOCH FROM ve."timestamp") AS epoch_time
    FROM video_embeddings ve
    WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  ),
  time_diffs AS (
    SELECT
      re.video_uuid,
      re."timestamp",
      re.text,
      re.similarity,
      re.row_num,
      re.epoch_time,
      COALESCE(re.epoch_time - LAG(re.epoch_time) OVER (PARTITION BY re.video_uuid ORDER BY re."timestamp"), 0) AS time_diff
    FROM ranked_embeddings re
  ),
  cumulative_sums AS (
    SELECT
      td.video_uuid,
      td."timestamp",
      td.text,
      td.similarity,
      td.row_num,
      td.epoch_time,
      SUM(td.time_diff) OVER (PARTITION BY td.video_uuid ORDER BY td."timestamp") AS cumulative_time
    FROM time_diffs td
  ),
  grouped_embeddings AS (
    SELECT
      cs.video_uuid,
      MIN(cs."timestamp") AS start_timestamp,
      MAX(cs."timestamp") AS end_timestamp,
      string_agg(cs.text, ' ') AS text,
      AVG(cs.similarity) AS similarity,
      FLOOR(cs.cumulative_time / 80) AS grp
    FROM cumulative_sums cs
    GROUP BY cs.video_uuid, FLOOR(cs.cumulative_time / 80)
  )
  SELECT
    ge.video_uuid,
    yt.video_id,
    ge.start_timestamp,
    ge.end_timestamp,
    ge.text,
    ge.similarity
  FROM grouped_embeddings ge
  JOIN youtube yt ON ge.video_uuid = yt.id
  ORDER BY ge.similarity DESC
  LIMIT match_count;
END;
$$;