DROP FUNCTION IF EXISTS fetch_random_clips_grouped_ve;

CREATE OR REPLACE FUNCTION fetch_random_clips_grouped_ve()
RETURNS TABLE (
  video_uuid uuid,
  video_id text,
  title text,
  description text,
  start_timestamp timestamptz,
  end_timestamp timestamptz,
  text text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gve.video_uuid,
    yt.video_id,
    yt.title,
    yt.description,
    gve.timestamp AS start_timestamp,
    gve.timestamp + make_interval(secs => EXTRACT(EPOCH FROM gve.duration)) AS end_timestamp,
    gve.text
  FROM grouped_video_embeddings gve
  JOIN youtube yt ON gve.video_uuid = yt.id
  ORDER BY random()
  LIMIT 20;
END;
$$;