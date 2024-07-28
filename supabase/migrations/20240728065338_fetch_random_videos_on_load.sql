CREATE OR REPLACE FUNCTION fetch_random_clips()
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
    ve.video_uuid,
    yt.video_id,
    yt.title,
    yt.description,
    ve.timestamp AS start_timestamp,
    ve.timestamp + interval '30 seconds' AS end_timestamp,
    ve.text
  FROM video_embeddings ve
  JOIN youtube yt ON ve.video_uuid = yt.id
  ORDER BY random()
  LIMIT 20;
END;
$$;