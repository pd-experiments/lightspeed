-- Drop the existing function
DROP FUNCTION IF EXISTS fetch_youtube_videos_with_embeddings_records();

CREATE OR REPLACE FUNCTION fetch_youtube_videos_with_embeddings_records()
RETURNS TABLE (
    video_id TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT yt.video_id
    FROM youtube yt
    JOIN video_embeddings ve ON yt.id = ve.video_uuid;
END;
$$;