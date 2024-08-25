create type "public"."ad_flow" as enum ('Ideation', 'Generation', 'Testing', 'Deployment');

drop trigger if exists "update_ad_experiments_modtime" on "public"."ad_experiments";

revoke delete on table "public"."ad_experiments" from "anon";

revoke insert on table "public"."ad_experiments" from "anon";

revoke references on table "public"."ad_experiments" from "anon";

revoke select on table "public"."ad_experiments" from "anon";

revoke trigger on table "public"."ad_experiments" from "anon";

revoke truncate on table "public"."ad_experiments" from "anon";

revoke update on table "public"."ad_experiments" from "anon";

revoke delete on table "public"."ad_experiments" from "authenticated";

revoke insert on table "public"."ad_experiments" from "authenticated";

revoke references on table "public"."ad_experiments" from "authenticated";

revoke select on table "public"."ad_experiments" from "authenticated";

revoke trigger on table "public"."ad_experiments" from "authenticated";

revoke truncate on table "public"."ad_experiments" from "authenticated";

revoke update on table "public"."ad_experiments" from "authenticated";

revoke delete on table "public"."ad_experiments" from "service_role";

revoke insert on table "public"."ad_experiments" from "service_role";

revoke references on table "public"."ad_experiments" from "service_role";

revoke select on table "public"."ad_experiments" from "service_role";

revoke trigger on table "public"."ad_experiments" from "service_role";

revoke truncate on table "public"."ad_experiments" from "service_role";

revoke update on table "public"."ad_experiments" from "service_role";

revoke delete on table "public"."advertisements" from "anon";

revoke insert on table "public"."advertisements" from "anon";

revoke references on table "public"."advertisements" from "anon";

revoke select on table "public"."advertisements" from "anon";

revoke trigger on table "public"."advertisements" from "anon";

revoke truncate on table "public"."advertisements" from "anon";

revoke update on table "public"."advertisements" from "anon";

revoke delete on table "public"."advertisements" from "authenticated";

revoke insert on table "public"."advertisements" from "authenticated";

revoke references on table "public"."advertisements" from "authenticated";

revoke select on table "public"."advertisements" from "authenticated";

revoke trigger on table "public"."advertisements" from "authenticated";

revoke truncate on table "public"."advertisements" from "authenticated";

revoke update on table "public"."advertisements" from "authenticated";

revoke delete on table "public"."advertisements" from "service_role";

revoke insert on table "public"."advertisements" from "service_role";

revoke references on table "public"."advertisements" from "service_role";

revoke select on table "public"."advertisements" from "service_role";

revoke trigger on table "public"."advertisements" from "service_role";

revoke truncate on table "public"."advertisements" from "service_role";

revoke update on table "public"."advertisements" from "service_role";

alter table "public"."ad_deployments" drop constraint "ad_tests_experiment_id_fkey";

alter table "public"."ad_experiments" drop constraint "ad_experiments_pkey";

alter table "public"."advertisements" drop constraint "advertisements_pkey";

drop index if exists "public"."advertisements_pkey";

drop index if exists "public"."ad_experiments_pkey";

drop table "public"."ad_experiments";

drop table "public"."advertisements";

create table "public"."ad_creations" (
    "id" uuid not null default gen_random_uuid(),
    "title" character varying(255) not null,
    "description" text,
    "objective" campaign_objective not null,
    "budget" numeric(10,2) not null,
    "duration" integer not null,
    "start_date" date not null,
    "end_date" date not null,
    "target_audience" jsonb not null,
    "ad_content" jsonb not null,
    "platforms" ad_platform[] not null,
    "political_leaning" political_leaning not null,
    "key_components" text[] not null,
    "status" ad_status not null default 'Draft'::ad_status,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "version_data" jsonb,
    "flow" ad_flow not null default 'Ideation'::ad_flow
);


alter table "public"."int_ads__google_ads_embeddings" add column "summary_embeddings" vector;

alter table "public"."int_ads__google_ads_embeddings" add column "tone" text[];

alter table "public"."int_ads__google_ads_enhanced" drop column "age_targeting";

alter table "public"."int_ads__google_ads_enhanced" add column "targeted_ages" text[];

alter table "public"."int_ads__google_ads_enhanced" add column "tone" text[];

alter table "public"."int_ads__google_ads_versioned" drop column "age_targeting";

alter table "public"."int_ads__google_ads_versioned" add column "targeted_ages" text[];

CREATE UNIQUE INDEX ad_experiments_pkey ON public.ad_creations USING btree (id);

alter table "public"."ad_creations" add constraint "ad_experiments_pkey" PRIMARY KEY using index "ad_experiments_pkey";

alter table "public"."ad_deployments" add constraint "ad_tests_experiment_id_fkey" FOREIGN KEY (experiment_id) REFERENCES ad_creations(id) not valid;

alter table "public"."ad_deployments" validate constraint "ad_tests_experiment_id_fkey";

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

grant delete on table "public"."ad_creations" to "anon";

grant insert on table "public"."ad_creations" to "anon";

grant references on table "public"."ad_creations" to "anon";

grant select on table "public"."ad_creations" to "anon";

grant trigger on table "public"."ad_creations" to "anon";

grant truncate on table "public"."ad_creations" to "anon";

grant update on table "public"."ad_creations" to "anon";

grant delete on table "public"."ad_creations" to "authenticated";

grant insert on table "public"."ad_creations" to "authenticated";

grant references on table "public"."ad_creations" to "authenticated";

grant select on table "public"."ad_creations" to "authenticated";

grant trigger on table "public"."ad_creations" to "authenticated";

grant truncate on table "public"."ad_creations" to "authenticated";

grant update on table "public"."ad_creations" to "authenticated";

grant delete on table "public"."ad_creations" to "service_role";

grant insert on table "public"."ad_creations" to "service_role";

grant references on table "public"."ad_creations" to "service_role";

grant select on table "public"."ad_creations" to "service_role";

grant trigger on table "public"."ad_creations" to "service_role";

grant truncate on table "public"."ad_creations" to "service_role";

grant update on table "public"."ad_creations" to "service_role";

CREATE TRIGGER update_ad_experiments_modtime BEFORE UPDATE ON public.ad_creations FOR EACH ROW EXECUTE FUNCTION update_modified_column();


