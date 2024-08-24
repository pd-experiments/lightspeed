create table "public"."tiktok_embeddings" (
    "id" uuid not null default gen_random_uuid(),
    "video_id" text,
    "author" text,
    "caption" text,
    "hashtags" text[],
    "topic" text,
    "views" integer,
    "created_at" date,
    "comments" jsonb,
    "summary" text,
    "keywords" text[],
    "political_leaning" text,
    "tone" text[],
    "caption_embedding" double precision[],
    "summary_embedding" double precision[]
);


alter table "public"."ad_experiments" add column "versions" jsonb;

CREATE UNIQUE INDEX tiktok_embeddings_pkey ON public.tiktok_embeddings USING btree (id);

alter table "public"."tiktok_embeddings" add constraint "tiktok_embeddings_pkey" PRIMARY KEY using index "tiktok_embeddings_pkey";

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
      array_agg((matches.match)[1])::TEXT[] AS hashtags  -- Ensure hashtags are returned as TEXT[]
    FROM 
      tiktok_videos AS v,
      LATERAL regexp_matches(v.text, '#\\w+', 'g') AS matches(match)
    GROUP BY 
      v.video_id
  )
  
  SELECT
    v.video_id,
    v.author,
    v.created_at,
    v.text AS caption,
    COALESCE(extracted_hashtags.hashtags, ARRAY[]::TEXT[]) AS hashtags, -- Handle possible NULL values
    v.hashtag AS topic,
    v.views,
    agg_comments.comments
  FROM tiktok_videos AS v
  LEFT JOIN extracted_hashtags ON v.video_id = extracted_hashtags.video_id
  LEFT JOIN agg_comments ON v.video_id = agg_comments.video_id;
END;
$function$
;

grant delete on table "public"."tiktok_embeddings" to "anon";

grant insert on table "public"."tiktok_embeddings" to "anon";

grant references on table "public"."tiktok_embeddings" to "anon";

grant select on table "public"."tiktok_embeddings" to "anon";

grant trigger on table "public"."tiktok_embeddings" to "anon";

grant truncate on table "public"."tiktok_embeddings" to "anon";

grant update on table "public"."tiktok_embeddings" to "anon";

grant delete on table "public"."tiktok_embeddings" to "authenticated";

grant insert on table "public"."tiktok_embeddings" to "authenticated";

grant references on table "public"."tiktok_embeddings" to "authenticated";

grant select on table "public"."tiktok_embeddings" to "authenticated";

grant trigger on table "public"."tiktok_embeddings" to "authenticated";

grant truncate on table "public"."tiktok_embeddings" to "authenticated";

grant update on table "public"."tiktok_embeddings" to "authenticated";

grant delete on table "public"."tiktok_embeddings" to "service_role";

grant insert on table "public"."tiktok_embeddings" to "service_role";

grant references on table "public"."tiktok_embeddings" to "service_role";

grant select on table "public"."tiktok_embeddings" to "service_role";

grant trigger on table "public"."tiktok_embeddings" to "service_role";

grant truncate on table "public"."tiktok_embeddings" to "service_role";

grant update on table "public"."tiktok_embeddings" to "service_role";


