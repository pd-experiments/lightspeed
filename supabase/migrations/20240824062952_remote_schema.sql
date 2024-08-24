create type "public"."ad_flow" as enum ('Ideation', 'Generation', 'Testing', 'Deployment');

alter table "public"."ad_experiments" add column "flow" ad_flow not null default 'Ideation'::ad_flow;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tiktok_video_data()
 RETURNS TABLE(video_id text, author text, created_at timestamp with time zone, caption text, hashtags text[], topic text, views integer, comments jsonb)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH ranked_comments AS (
    SELECT
      c.video_id,
      c.text,
      c.likes,
      ROW_NUMBER() OVER (
        PARTITION BY c.video_id
        ORDER BY c.likes DESC NULLS LAST
      ) AS rn
    FROM tiktok_comments AS c
  ),
  
  agg_comments AS (
    SELECT
      c.video_id,
      jsonb_agg(
        jsonb_build_object(
          'text', c.text,
          'likes', c.likes
        )
      ) AS comments
    FROM ranked_comments AS c
    WHERE c.rn <= 15
    GROUP BY c.video_id
  ),
  
  extracted_hashtags AS (
    SELECT
      v.video_id,
      array_agg((matches.match)[1]) AS hashtags
    FROM 
      tiktok_videos AS v,
      LATERAL regexp_matches(v.text, '#\w+', 'g') AS matches(match)
    GROUP BY 
      v.video_id
  )
  
  SELECT
    v.video_id,
    v.author,
    v.created_at,
    v.text AS caption,
    extracted_hashtags.hashtags AS hashtags, -- Handle possible NULL values
    v.hashtag AS topic,
    v.views,
    agg_comments.comments
  FROM tiktok_videos AS v
  LEFT JOIN extracted_hashtags ON v.video_id = extracted_hashtags.video_id
  LEFT JOIN agg_comments ON v.video_id = agg_comments.video_id;
END;
$function$
;


