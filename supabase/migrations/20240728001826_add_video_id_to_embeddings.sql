ALTER TABLE video_embeddings
ADD COLUMN video_id TEXT;

UPDATE video_embeddings
SET video_id = yt.video_id
FROM youtube yt
WHERE video_embeddings.video_uuid = yt.id;

ALTER TABLE video_embeddings
ALTER COLUMN video_id SET NOT NULL;