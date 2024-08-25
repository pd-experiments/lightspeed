create type "public"."ad_flow" as enum ('Ideation', 'Generation', 'Testing', 'Deployment');

create type "public"."ad_platform" as enum ('Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube');

create type "public"."ad_status" as enum ('Draft', 'In Review', 'Active', 'Configured', 'Generated', 'Test', 'Deployed');

create type "public"."campaign_objective" as enum ('awareness', 'consideration', 'conversion');

create type "public"."political_leaning" as enum ('left', 'center-left', 'center', 'center-right', 'right');

create table "public"."ad_experiments" (
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


create table "public"."ad_tests" (
    "id" uuid not null default uuid_generate_v4(),
    "experiment_id" uuid,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "platform" text not null,
    "version_id" text not null,
    "budget" numeric not null,
    "duration" integer not null,
    "audience" text not null,
    "placement" text not null,
    "bid_strategy" text not null,
    "image_url" text,
    "video_url" text,
    "caption" text not null,
    "link" text not null,
    "adset_id" text
);


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


alter table "public"."int_ads__google_ads_embeddings" add column "summary_embeddings" vector;

alter table "public"."int_ads__google_ads_enhanced" add column "summary_embeddings" vector(1536);

CREATE UNIQUE INDEX ad_experiments_pkey ON public.ad_experiments USING btree (id);

CREATE INDEX ad_tests_experiment_id_idx ON public.ad_tests USING btree (experiment_id);

CREATE UNIQUE INDEX ad_tests_pkey ON public.ad_tests USING btree (id);

CREATE INDEX idx_summary_embeddings ON public.int_ads__google_ads_enhanced USING ivfflat (summary_embeddings);

CREATE UNIQUE INDEX tiktok_embeddings_pkey ON public.tiktok_embeddings USING btree (id);

CREATE UNIQUE INDEX unique_experiment_platform_version ON public.ad_tests USING btree (experiment_id, platform, version_id);

alter table "public"."ad_experiments" add constraint "ad_experiments_pkey" PRIMARY KEY using index "ad_experiments_pkey";

alter table "public"."ad_tests" add constraint "ad_tests_pkey" PRIMARY KEY using index "ad_tests_pkey";

alter table "public"."tiktok_embeddings" add constraint "tiktok_embeddings_pkey" PRIMARY KEY using index "tiktok_embeddings_pkey";

alter table "public"."ad_tests" add constraint "ad_tests_experiment_id_fkey" FOREIGN KEY (experiment_id) REFERENCES ad_experiments(id) not valid;

alter table "public"."ad_tests" validate constraint "ad_tests_experiment_id_fkey";

alter table "public"."ad_tests" add constraint "unique_experiment_platform_version" UNIQUE using index "unique_experiment_platform_version";

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

CREATE OR REPLACE FUNCTION public.int_ads__google_ads_enhanced__semantic_search(query_embedding vector, match_threshold double precision)
 RETURNS SETOF int_ads__google_ads_enhanced
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT *
    FROM
        int_ads__google_ads_enhanced as e
    WHERE
        summary_embeddings <#> query_embedding < -match_threshold
    ORDER BY
        summary_embeddings <#> query_embedding;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_threshold double precision)
 RETURNS SETOF int_ads__google_ads_enhanced
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        e.id as row_id,
        advertisement_url,
        advertiser_name,
        advertiser_url,
        first_shown,
        last_shown,
        days_ran_for,
        format,
        content,
        version,
        targeted_ages,
        gender_targeting,
        geo_targeting,
        keywords,
        summary,
        summary_embeddings,
        political_leaning,
        tone
    FROM
        int_ads__google_ads_enhanced as e
    WHERE
        summary_embeddings <#> query_embedding > match_threshold
    ORDER BY
        summary_embeddings <#> query_embedding DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_update_int_ads__google_ads_enhanced()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Delete from the enhanced table if a row is deleted
    IF TG_OP = 'DELETE' THEN
        DELETE FROM int_ads__google_ads_enhanced
        WHERE id = OLD.id;

        RETURN OLD;
    END IF;

    -- Upsert the row into the enhanced table
    INSERT INTO int_ads__google_ads_enhanced (
        id,
        advertisement_url,
        advertiser_name,
        advertiser_url,
        first_shown,
        last_shown,
        days_ran_for,
        format,
        content,
        version,
        targeted_ages,
        gender_targeting,
        geo_targeting,
        keywords,
        summary,
        summary_embeddings,
        political_leaning,
        tone
    )
    SELECT
        v.id AS id,
        v.advertisement_url,
        v.advertiser_name,
        v.advertiser_url,
        v.first_shown,
        v.last_shown,
        v.days_ran_for,
        v.format,
        v.content,
        v.version,
        v.targeted_ages,
        v.gender_targeting,
        v.geo_targeting,
        e.keywords,
        e.summary,
        e.summary_embeddings,
        e.political_leaning,
        e.tone
    FROM
        int_ads__google_ads_versioned v
    LEFT JOIN
        int_ads__google_ads_embeddings e
    ON
        v.id = e.versioned_ad_id
    WHERE
        v.id = NEW.id;

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."ad_experiments" to "anon";

grant insert on table "public"."ad_experiments" to "anon";

grant references on table "public"."ad_experiments" to "anon";

grant select on table "public"."ad_experiments" to "anon";

grant trigger on table "public"."ad_experiments" to "anon";

grant truncate on table "public"."ad_experiments" to "anon";

grant update on table "public"."ad_experiments" to "anon";

grant delete on table "public"."ad_experiments" to "authenticated";

grant insert on table "public"."ad_experiments" to "authenticated";

grant references on table "public"."ad_experiments" to "authenticated";

grant select on table "public"."ad_experiments" to "authenticated";

grant trigger on table "public"."ad_experiments" to "authenticated";

grant truncate on table "public"."ad_experiments" to "authenticated";

grant update on table "public"."ad_experiments" to "authenticated";

grant delete on table "public"."ad_experiments" to "service_role";

grant insert on table "public"."ad_experiments" to "service_role";

grant references on table "public"."ad_experiments" to "service_role";

grant select on table "public"."ad_experiments" to "service_role";

grant trigger on table "public"."ad_experiments" to "service_role";

grant truncate on table "public"."ad_experiments" to "service_role";

grant update on table "public"."ad_experiments" to "service_role";

grant delete on table "public"."ad_tests" to "anon";

grant insert on table "public"."ad_tests" to "anon";

grant references on table "public"."ad_tests" to "anon";

grant select on table "public"."ad_tests" to "anon";

grant trigger on table "public"."ad_tests" to "anon";

grant truncate on table "public"."ad_tests" to "anon";

grant update on table "public"."ad_tests" to "anon";

grant delete on table "public"."ad_tests" to "authenticated";

grant insert on table "public"."ad_tests" to "authenticated";

grant references on table "public"."ad_tests" to "authenticated";

grant select on table "public"."ad_tests" to "authenticated";

grant trigger on table "public"."ad_tests" to "authenticated";

grant truncate on table "public"."ad_tests" to "authenticated";

grant update on table "public"."ad_tests" to "authenticated";

grant delete on table "public"."ad_tests" to "service_role";

grant insert on table "public"."ad_tests" to "service_role";

grant references on table "public"."ad_tests" to "service_role";

grant select on table "public"."ad_tests" to "service_role";

grant trigger on table "public"."ad_tests" to "service_role";

grant truncate on table "public"."ad_tests" to "service_role";

grant update on table "public"."ad_tests" to "service_role";

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

CREATE TRIGGER update_ad_experiments_modtime BEFORE UPDATE ON public.ad_experiments FOR EACH ROW EXECUTE FUNCTION update_modified_column();


