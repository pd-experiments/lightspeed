ALTER TABLE outline_elements
ADD COLUMN video_id TEXT;

UPDATE outline_elements
SET video_id = yt.video_id
FROM youtube yt
WHERE outline_elements.video_uuid = yt.id;

ALTER TABLE outline_elements
ALTER COLUMN video_id SET NOT NULL;