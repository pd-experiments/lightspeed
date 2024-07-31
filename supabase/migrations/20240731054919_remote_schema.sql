create table "public"."grouped_video_embeddings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "video_uuid" uuid not null default gen_random_uuid(),
    "timestamp" timestamp with time zone not null,
    "soundbytes" uuid[] not null default '{}'::uuid[],
    "embedding" vector,
    "text" text,
    "duration" timestamp with time zone not null default now()
);


alter table "public"."frames_records" add column "embedding" vector;

alter table "public"."frames_records" add column "timestamp" timestamp with time zone;

alter table "public"."frames_records" disable row level security;

alter table "public"."video_embeddings" add column "duration" timestamp with time zone not null default now();

CREATE UNIQUE INDEX grouped_video_embeddings_pkey ON public.grouped_video_embeddings USING btree (id);

alter table "public"."grouped_video_embeddings" add constraint "grouped_video_embeddings_pkey" PRIMARY KEY using index "grouped_video_embeddings_pkey";

alter table "public"."grouped_video_embeddings" add constraint "grouped_video_embeddings_video_uuid_fkey" FOREIGN KEY (video_uuid) REFERENCES youtube(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."grouped_video_embeddings" validate constraint "grouped_video_embeddings_video_uuid_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_youtube_videos_with_embeddings_records()
 RETURNS TABLE(video_id text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT yt.video_id
    FROM youtube yt
    JOIN video_embeddings ve ON yt.id = ve.video_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_grouped_video_embeddings()
 RETURNS TABLE(video_uuid uuid, soundbytes json[])
 LANGUAGE sql
AS $function$
  SELECT
    video_uuid,
    array_agg(
      json_build_object(
        'id', id,
        'timestamp', timestamp,
        'duration', duration,
        'text', text,
        'video_id', video_id
      )
      ORDER BY timestamp
    ) as soundbytes
  FROM video_embeddings
  GROUP BY 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_latest_unique_youtube_videos()
 RETURNS SETOF youtube
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH ranked_videos AS (
        SELECT
            id,
            ROW_NUMBER() OVER (PARTITION BY video_id ORDER BY created_at DESC) AS rnum
        FROM
            youtube
    )
    SELECT youtube.*
    FROM youtube
    INNER JOIN ranked_videos on youtube.id = ranked_videos.id
    WHERE ranked_videos.rnum = 1;
END;
$function$
;

grant delete on table "public"."grouped_video_embeddings" to "anon";

grant insert on table "public"."grouped_video_embeddings" to "anon";

grant references on table "public"."grouped_video_embeddings" to "anon";

grant select on table "public"."grouped_video_embeddings" to "anon";

grant trigger on table "public"."grouped_video_embeddings" to "anon";

grant truncate on table "public"."grouped_video_embeddings" to "anon";

grant update on table "public"."grouped_video_embeddings" to "anon";

grant delete on table "public"."grouped_video_embeddings" to "authenticated";

grant insert on table "public"."grouped_video_embeddings" to "authenticated";

grant references on table "public"."grouped_video_embeddings" to "authenticated";

grant select on table "public"."grouped_video_embeddings" to "authenticated";

grant trigger on table "public"."grouped_video_embeddings" to "authenticated";

grant truncate on table "public"."grouped_video_embeddings" to "authenticated";

grant update on table "public"."grouped_video_embeddings" to "authenticated";

grant delete on table "public"."grouped_video_embeddings" to "service_role";

grant insert on table "public"."grouped_video_embeddings" to "service_role";

grant references on table "public"."grouped_video_embeddings" to "service_role";

grant select on table "public"."grouped_video_embeddings" to "service_role";

grant trigger on table "public"."grouped_video_embeddings" to "service_role";

grant truncate on table "public"."grouped_video_embeddings" to "service_role";

grant update on table "public"."grouped_video_embeddings" to "service_role";


