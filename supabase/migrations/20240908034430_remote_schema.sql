create type "public"."deployment_status" as enum ('Created', 'Deployed', 'Running', 'Paused', 'Complete');

create type "public"."taglines_post_type" as enum ('Draft', 'Live', 'Archive');

drop trigger if exists "trg_update_int_ads__google_ads_versioned" on "public"."stg_ads__google_ads";

drop trigger if exists "trg_update_int_ads__google_advertisers" on "public"."stg_ads__google_ads";

revoke delete on table "public"."news" from "anon";

revoke insert on table "public"."news" from "anon";

revoke references on table "public"."news" from "anon";

revoke select on table "public"."news" from "anon";

revoke trigger on table "public"."news" from "anon";

revoke truncate on table "public"."news" from "anon";

revoke update on table "public"."news" from "anon";

revoke delete on table "public"."news" from "authenticated";

revoke insert on table "public"."news" from "authenticated";

revoke references on table "public"."news" from "authenticated";

revoke select on table "public"."news" from "authenticated";

revoke trigger on table "public"."news" from "authenticated";

revoke truncate on table "public"."news" from "authenticated";

revoke update on table "public"."news" from "authenticated";

revoke delete on table "public"."news" from "service_role";

revoke insert on table "public"."news" from "service_role";

revoke references on table "public"."news" from "service_role";

revoke select on table "public"."news" from "service_role";

revoke trigger on table "public"."news" from "service_role";

revoke truncate on table "public"."news" from "service_role";

revoke update on table "public"."news" from "service_role";

drop function if exists "public"."int_ads__google_ads_enhanced__semantic_search"(query_embedding vector, match_threshold double precision);

drop function if exists "public"."match_documents"(query_embedding vector, match_threshold double precision);

alter table "public"."news" drop constraint "news_pkey";

drop index if exists "public"."news_pkey";

drop table "public"."news";

alter type "public"."ad_platform" rename to "ad_platform__old_version_to_be_dropped";

create type "public"."ad_platform" as enum ('Facebook', 'Instagram Post', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 'Instagram Reel', 'Instagram Story', 'Threads');

alter type "public"."ad_status" rename to "ad_status__old_version_to_be_dropped";

create type "public"."ad_status" as enum ('Draft', 'In Review', 'Configured', 'Generated');

create table "public"."ad_taglines" (
    "created_at" timestamp with time zone not null default now(),
    "tagline" text,
    "post_text" text,
    "post_hashtags" text[],
    "status" taglines_post_type not null default 'Draft'::taglines_post_type,
    "title" text,
    "ad_description" text,
    "id" uuid not null default gen_random_uuid(),
    "ad_id" uuid,
    "image_url" text,
    "platform" "platformType"[]
);


alter table "public"."ad_taglines" enable row level security;

create table "public"."ai_ads_data" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "top_advertisers" jsonb,
    "recent_ads" jsonb,
    "ad_formats" jsonb,
    "age_targeting" jsonb,
    "gender_targeting" jsonb,
    "geo_targeting" jsonb,
    "political_leanings" jsonb,
    "keyword_analysis" jsonb,
    "tone_analysis" jsonb,
    "date_range_analysis" jsonb
);


create table "public"."ai_conversations_data" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "trending_topics" jsonb,
    "hot_issues" jsonb,
    "content_themes" jsonb,
    "influential_figures" jsonb,
    "news_articles" jsonb
);


create table "public"."ai_query_suggestions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "suggestions" jsonb not null
);


create table "public"."ai_suggestions_data" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "suggestions" jsonb
);


create table "public"."int_news" (
    "id" uuid not null default gen_random_uuid(),
    "source_url" text not null,
    "url" text not null,
    "title" text not null,
    "authors" text[] not null,
    "publish_date" timestamp with time zone not null,
    "ai_summary" text not null,
    "summary_embedding" vector(1536) not null,
    "political_keywords" text[] not null,
    "political_leaning" text not null,
    "political_tones" text[] not null,
    "issues" text[] not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."int_threads" (
    "id" uuid not null default gen_random_uuid(),
    "thread_id" text not null,
    "text" text not null,
    "row_created_at" timestamp with time zone default now(),
    "row_updated_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "likes" integer,
    "replies" integer,
    "reposts" integer,
    "raw_text_embedding" vector(1536),
    "summary_embedding" vector(1536),
    "hashtags" text[],
    "ai_summary" text,
    "political_keywords" text[],
    "political_leaning" text,
    "political_tones" text[],
    "issues" text[]
);


create table "public"."stg_news" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "source_url" text,
    "url" text,
    "title" text,
    "authors" text[],
    "publish_date" timestamp with time zone,
    "summary" text,
    "text" text,
    "html" text,
    "article_html" text,
    "movies" text[],
    "keywords" text[],
    "meta_keywords" text[],
    "tags" text[]
);


alter table "public"."ad_creations" alter column status type "public"."ad_status" using status::text::"public"."ad_status";

drop type "public"."ad_platform__old_version_to_be_dropped";

drop type "public"."ad_status__old_version_to_be_dropped";

alter table "public"."ad_creations" add column "image_urls" text[];

alter table "public"."ad_creations" alter column "status" drop default;

alter table "public"."ad_creations" alter column "status" drop not null;

alter table "public"."ad_deployments" add column "adset_budget" double precision;

alter table "public"."ad_deployments" add column "adset_name" text;

alter table "public"."ad_deployments" add column "campaign_info" jsonb;

alter table "public"."ad_deployments" add column "content_insights" jsonb;

alter table "public"."ad_deployments" add column "performance_data" jsonb;

alter table "public"."ad_deployments" alter column "status" set default 'Created'::deployment_status;

alter table "public"."ad_deployments" alter column "status" set data type deployment_status using "status"::deployment_status;

alter table "public"."int_ads__google_ads_embeddings" add column "advertiser_name_embedding" vector;

alter table "public"."int_ads__google_ads_enhanced" add column "advertiser_name_embedding" vector(1536);

alter table "public"."int_ads__google_ads_enhanced" add column "max_impressions" integer;

alter table "public"."int_ads__google_ads_enhanced" add column "max_spend" integer;

alter table "public"."int_ads__google_ads_enhanced" add column "min_impressions" integer;

alter table "public"."int_ads__google_ads_enhanced" add column "min_spend" integer;

alter table "public"."stg_ads__google_ads" add column "impressions" text;

alter table "public"."stg_ads__google_ads" add column "spend" text;

CREATE UNIQUE INDEX ad_taglines_pkey ON public.ad_taglines USING btree (id);

CREATE UNIQUE INDEX ai_ads_data_pkey ON public.ai_ads_data USING btree (id);

CREATE UNIQUE INDEX ai_conversations_data_pkey ON public.ai_conversations_data USING btree (id);

CREATE UNIQUE INDEX ai_suggestions_data_pkey ON public.ai_suggestions_data USING btree (id);

CREATE UNIQUE INDEX int_news_pkey ON public.int_news USING btree (id);

CREATE UNIQUE INDEX int_threads_pkey1 ON public.int_threads USING btree (id);

CREATE UNIQUE INDEX query_suggestions_pkey ON public.ai_query_suggestions USING btree (id);

CREATE UNIQUE INDEX news_pkey ON public.stg_news USING btree (id);

alter table "public"."ad_taglines" add constraint "ad_taglines_pkey" PRIMARY KEY using index "ad_taglines_pkey";

alter table "public"."ai_ads_data" add constraint "ai_ads_data_pkey" PRIMARY KEY using index "ai_ads_data_pkey";

alter table "public"."ai_conversations_data" add constraint "ai_conversations_data_pkey" PRIMARY KEY using index "ai_conversations_data_pkey";

alter table "public"."ai_query_suggestions" add constraint "query_suggestions_pkey" PRIMARY KEY using index "query_suggestions_pkey";

alter table "public"."ai_suggestions_data" add constraint "ai_suggestions_data_pkey" PRIMARY KEY using index "ai_suggestions_data_pkey";

alter table "public"."int_news" add constraint "int_news_pkey" PRIMARY KEY using index "int_news_pkey";

alter table "public"."int_threads" add constraint "int_threads_pkey1" PRIMARY KEY using index "int_threads_pkey1";

alter table "public"."stg_news" add constraint "news_pkey" PRIMARY KEY using index "news_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_ads_advanced(_keywords text[], _embedding vector, _leaning text[], _tones text[], _advertiser_name_embedding vector, _alpha double precision DEFAULT 0.25, _beta double precision DEFAULT 0.20, _gamma double precision DEFAULT 0.10, _delta double precision DEFAULT 0.35, _epsilon double precision DEFAULT 0.10, _zeta double precision DEFAULT 0.10)
 RETURNS TABLE(id uuid, advertisement_url text, advertiser_name text, advertiser_url text, first_shown date, last_shown date, days_ran_for integer, format text, content text, version integer, targeted_ages text[], gender_targeting jsonb, geo_targeting jsonb, keywords text[], summary text, political_leaning text, tone text[], keyword_score integer, leaning_score integer, tones_score integer, embedding_score double precision, date_score double precision, advertiser_name_score double precision, final_score double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH distance_mapping AS (
        -- Define distances for political leanings
        SELECT 
            'Unknown' AS leaning, 0 AS distance UNION ALL
            SELECT 'Faith and Flag Conservatives', 1 UNION ALL
            SELECT 'Committed Conservatives', 2 UNION ALL
            SELECT 'Populist Right', 3 UNION ALL
            SELECT 'Ambivalent Right', 4 UNION ALL
            SELECT 'Moderate', 5 UNION ALL
            SELECT 'Outsider Left', 6 UNION ALL
            SELECT 'Democratic Mainstays', 7 UNION ALL
            SELECT 'Establishment Liberals', 8 UNION ALL
            SELECT 'Progressive Left', 9
    ),
    keyword_match AS (
        -- Count the number of matching keywords
        SELECT a.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(a.keywords) 
                           INTERSECT 
                           SELECT unnest(_keywords)
                       ), 1
                   ), 0
               ) AS keyword_score
        FROM public.int_ads__google_ads_enhanced a
    ),
    leaning_match AS (
        -- Compute distance-based leaning score
        SELECT keyword_match.*, 
               COALESCE(
                   (SELECT MIN(ABS(d1.distance - d2.distance))
                    FROM distance_mapping d1, distance_mapping d2
                    WHERE d1.leaning = keyword_match.political_leaning
                    AND d2.leaning = ANY(_leaning)
                   ), 0
               ) AS leaning_score
        FROM keyword_match
    ),
    tones_match AS (
        -- Count the number of matching tones
        SELECT leaning_match.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(leaning_match.tone) 
                           INTERSECT 
                           SELECT unnest(_tones)
                       ), 1
                   ), 0
               ) AS tones_score
        FROM leaning_match
    ),
    embedding_match AS (
        -- Compute embedding score using cosine similarity
        SELECT tones_match.*, 
               COALESCE(
                   1 - (tones_match.summary_embeddings <=> _embedding)::double precision, 
                   0
               ) AS embedding_score
        FROM tones_match
    ),
    advertiser_name_match AS (
        -- Compute cosine similarity score for advertiser name
        SELECT embedding_match.*, 
               COALESCE(
                   1 - (embedding_match.summary_embeddings <=> _advertiser_name_embedding)::double precision, 
                   0
               ) AS advertiser_name_score
        FROM embedding_match
    ),
    date_match AS (
        -- Apply recency score based on first_shown date (more recent is better)
        SELECT advertiser_name_match.*, 
               EXTRACT(EPOCH FROM (NOW() - advertiser_name_match.first_shown)) / (60 * 60 * 24 * 365) AS year_diff,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - advertiser_name_match.first_shown)) < (60 * 60 * 24 * 365) 
                 THEN COALESCE(
                     1 - (EXTRACT(EPOCH FROM (NOW() - advertiser_name_match.first_shown)) / (60 * 60 * 24 * 365))::double precision, 
                     0
                   )
                 ELSE 0
               END AS date_score
        FROM advertiser_name_match
    )
    -- Compute the final score as a weighted sum of individual scores
    SELECT 
        date_match.id, 
        date_match.advertisement_url, 
        date_match.advertiser_name, 
        date_match.advertiser_url, 
        date_match.first_shown, 
        date_match.last_shown, 
        date_match.days_ran_for, 
        date_match.format, 
        date_match.content, 
        date_match.version, 
        date_match.targeted_ages, 
        date_match.gender_targeting, 
        date_match.geo_targeting, 
        date_match.keywords, 
        date_match.summary, 
        date_match.political_leaning, 
        date_match.tone, 
        date_match.keyword_score, 
        date_match.leaning_score, 
        date_match.tones_score, 
        date_match.embedding_score, 
        date_match.date_score,
        date_match.advertiser_name_score,
        COALESCE(
            (_alpha * date_match.keyword_score 
             + _beta * date_match.leaning_score 
             + _gamma * date_match.tones_score 
             + _delta * date_match.embedding_score 
             + _epsilon * date_match.date_score
             + _zeta * date_match.advertiser_name_score)::double precision, 
            0
        ) AS final_score
    FROM date_match
    ORDER BY final_score DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_ads_advanced(_keywords text[], _embedding vector, _leaning text[], _tones text[], _advertiser_name_embedding vector, _min_spend integer DEFAULT NULL::integer, _max_spend integer DEFAULT NULL::integer, _min_impressions integer DEFAULT NULL::integer, _max_impressions integer DEFAULT NULL::integer, _keyword_weight double precision DEFAULT 0.25, _leaning_weight double precision DEFAULT 0.20, _tones_weight double precision DEFAULT 0.10, _embedding_weight double precision DEFAULT 0.35, _date_weight double precision DEFAULT 0.10, _advertiser_name_weight double precision DEFAULT 0.10, _spend_weight double precision DEFAULT 0.10, _impressions_weight double precision DEFAULT 0.10)
 RETURNS TABLE(id uuid, advertisement_url text, advertiser_name text, advertiser_url text, first_shown date, last_shown date, days_ran_for integer, format text, content text, version integer, targeted_ages text[], gender_targeting jsonb, geo_targeting jsonb, keywords text[], summary text, political_leaning text, tone text[], keyword_score integer, leaning_score integer, tones_score integer, embedding_score double precision, date_score double precision, advertiser_name_score double precision, spend_score double precision, impressions_score double precision, final_score double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH distance_mapping AS (
        -- Define distances for political leanings
        SELECT 
            'Unknown' AS leaning, 0 AS distance UNION ALL
            SELECT 'Faith and Flag Conservatives', 1 UNION ALL
            SELECT 'Committed Conservatives', 2 UNION ALL
            SELECT 'Populist Right', 3 UNION ALL
            SELECT 'Ambivalent Right', 4 UNION ALL
            SELECT 'Moderate', 5 UNION ALL
            SELECT 'Outsider Left', 6 UNION ALL
            SELECT 'Democratic Mainstays', 7 UNION ALL
            SELECT 'Establishment Liberals', 8 UNION ALL
            SELECT 'Progressive Left', 9
    ),
    keyword_match AS (
        -- Count the number of matching keywords
        SELECT a.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(a.keywords) 
                           INTERSECT 
                           SELECT unnest(_keywords)
                       ), 1
                   ), 0
               ) AS keyword_score
        FROM public.int_ads__google_ads_enhanced a
    ),
    leaning_match AS (
        -- Compute distance-based leaning score
        SELECT keyword_match.*, 
               COALESCE(
                   (SELECT MIN(ABS(d1.distance - d2.distance))
                    FROM distance_mapping d1, distance_mapping d2
                    WHERE d1.leaning = keyword_match.political_leaning
                    AND d2.leaning = ANY(_leaning)
                   ), 0
               ) AS leaning_score
        FROM keyword_match
    ),
    tones_match AS (
        -- Count the number of matching tones
        SELECT leaning_match.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(leaning_match.tone) 
                           INTERSECT 
                           SELECT unnest(_tones)
                       ), 1
                   ), 0
               ) AS tones_score
        FROM leaning_match
    ),
    embedding_match AS (
        -- Compute embedding score using cosine similarity
        SELECT tones_match.*, 
               COALESCE(
                   1 - (tones_match.summary_embeddings <=> _embedding)::double precision, 
                   0
               ) AS embedding_score
        FROM tones_match
    ),
    advertiser_name_match AS (
        -- Compute cosine similarity score for advertiser name
        SELECT embedding_match.*, 
               COALESCE(
                   1 - (embedding_match.summary_embeddings <=> _advertiser_name_embedding)::double precision, 
                   0
               ) AS advertiser_name_score
        FROM embedding_match
    ),
    spend_impressions_score AS (
        -- Compute scores based on how far spend and impressions are from the desired ranges
        SELECT advertiser_name_match.*, 
               COALESCE(
                   CASE
                       WHEN _min_spend IS NULL AND _max_spend IS NULL THEN 1
                       WHEN min_spend IS NULL OR max_spend IS NULL THEN 0
                       ELSE
                           CASE
                               WHEN _min_spend IS NOT NULL AND min_spend < _min_spend THEN 
                                   1 - LEAST(1, (CAST(_min_spend - min_spend AS double precision) / GREATEST(_min_spend, 1)))
                               WHEN _max_spend IS NOT NULL AND max_spend > _max_spend THEN 
                                   1 - LEAST(1, (CAST(max_spend - _max_spend AS double precision) / GREATEST(_max_spend, 1)))
                               ELSE 1
                           END
                   END, 0
               ) AS spend_score,
               COALESCE(
                   CASE
                       WHEN _min_impressions IS NULL AND _max_impressions IS NULL THEN 1
                       WHEN min_impressions IS NULL OR max_impressions IS NULL THEN 0
                       ELSE
                           CASE
                               WHEN _min_impressions IS NOT NULL AND min_impressions < _min_impressions THEN 
                                   1 - LEAST(1, (CAST(_min_impressions - min_impressions AS double precision) / GREATEST(_min_impressions, 1)))
                               WHEN _max_impressions IS NOT NULL AND max_impressions > _max_impressions THEN 
                                   1 - LEAST(1, (CAST(max_impressions - _max_impressions AS double precision) / GREATEST(_max_impressions, 1)))
                               ELSE 1
                           END
                   END, 0
               ) AS impressions_score
        FROM advertiser_name_match
    ),
    date_match AS (
        -- Apply recency score based on first_shown date (more recent is better)
        SELECT spend_impressions_score.*, 
               EXTRACT(EPOCH FROM (NOW() - spend_impressions_score.first_shown)) / (60 * 60 * 24 * 365) AS year_diff,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - spend_impressions_score.first_shown)) < (60 * 60 * 24 * 365) 
                 THEN COALESCE(
                     1 - (EXTRACT(EPOCH FROM (NOW() - spend_impressions_score.first_shown)) / (60 * 60 * 24 * 365))::double precision, 
                     0
                   )
                 ELSE 0
               END AS date_score
        FROM spend_impressions_score
    )
    -- Compute the final score as a weighted sum of individual scores
    SELECT 
        date_match.id, 
        date_match.advertisement_url, 
        date_match.advertiser_name, 
        date_match.advertiser_url, 
        date_match.first_shown, 
        date_match.last_shown, 
        date_match.days_ran_for, 
        date_match.format, 
        date_match.content, 
        date_match.version, 
        date_match.targeted_ages, 
        date_match.gender_targeting, 
        date_match.geo_targeting, 
        date_match.keywords, 
        date_match.summary, 
        date_match.political_leaning, 
        date_match.tone, 
        date_match.keyword_score, 
        date_match.leaning_score, 
        date_match.tones_score, 
        date_match.embedding_score, 
        date_match.date_score,
        date_match.advertiser_name_score,
        date_match.spend_score,
        date_match.impressions_score,
        COALESCE(
            (_keyword_weight * date_match.keyword_score 
             + _leaning_weight * date_match.leaning_score 
             + _tones_weight * date_match.tones_score 
             + _embedding_weight * date_match.embedding_score 
             + _date_weight * date_match.date_score
             + _advertiser_name_weight * date_match.advertiser_name_score
             + _spend_weight * date_match.spend_score
             + _impressions_weight * date_match.impressions_score)::double precision, 
            0
        ) AS final_score
    FROM date_match
    ORDER BY final_score DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_ads_advanced(_keywords text[], _embedding vector, _leaning text[], _tones text[], _advertiser_name_embedding vector, _weight_keyword double precision DEFAULT 0.20, _weight_leaning double precision DEFAULT 0.15, _weight_tones double precision DEFAULT 0.10, _weight_embedding double precision DEFAULT 0.25, _weight_recency double precision DEFAULT 0.10, _weight_advertiser_name double precision DEFAULT 0.10, _weight_spend double precision DEFAULT 0.05, _weight_impressions double precision DEFAULT 0.05)
 RETURNS TABLE(id uuid, advertisement_url text, advertiser_name text, advertiser_url text, first_shown date, last_shown date, days_ran_for integer, format text, content text, version integer, targeted_ages text[], gender_targeting jsonb, geo_targeting jsonb, keywords text[], summary text, political_leaning text, tone text[], min_spend integer, max_spend integer, min_impressions integer, max_impressions integer, keyword_score integer, leaning_score integer, tones_score integer, embedding_score double precision, date_score double precision, advertiser_name_score double precision, spend_score double precision, impressions_score double precision, final_score double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH distance_mapping AS (
        -- Define distances for political leanings
        SELECT 
            'Unknown' AS leaning, 0 AS distance UNION ALL
            SELECT 'Faith and Flag Conservatives', 1 UNION ALL
            SELECT 'Committed Conservatives', 2 UNION ALL
            SELECT 'Populist Right', 3 UNION ALL
            SELECT 'Ambivalent Right', 4 UNION ALL
            SELECT 'Moderate', 5 UNION ALL
            SELECT 'Outsider Left', 6 UNION ALL
            SELECT 'Democratic Mainstays', 7 UNION ALL
            SELECT 'Establishment Liberals', 8 UNION ALL
            SELECT 'Progressive Left', 9
    ),
    keyword_match AS (
        -- Count the number of matching keywords
        SELECT a.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(a.keywords) 
                           INTERSECT 
                           SELECT unnest(_keywords)
                       ), 1
                   ), 0
               ) AS keyword_score
        FROM public.int_ads__google_ads_enhanced a
    ),
    leaning_match AS (
        -- Compute distance-based leaning score
        SELECT keyword_match.*, 
               COALESCE(
                   (SELECT MIN(ABS(d1.distance - d2.distance))
                    FROM distance_mapping d1, distance_mapping d2
                    WHERE d1.leaning = keyword_match.political_leaning
                    AND d2.leaning = ANY(_leaning)
                   ), 0
               ) AS leaning_score
        FROM keyword_match
    ),
    tones_match AS (
        -- Count the number of matching tones
        SELECT leaning_match.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(leaning_match.tone) 
                           INTERSECT 
                           SELECT unnest(_tones)
                       ), 1
                   ), 0
               ) AS tones_score
        FROM leaning_match
    ),
    embedding_match AS (
        -- Compute embedding score using cosine similarity
        SELECT tones_match.*, 
               COALESCE(
                   1 - (tones_match.summary_embeddings <=> _embedding)::double precision, 
                   0
               ) AS embedding_score
        FROM tones_match
    ),
    advertiser_name_match AS (
        -- Compute cosine similarity score for advertiser name
        SELECT embedding_match.*, 
               COALESCE(
                   1 - (embedding_match.summary_embeddings <=> _advertiser_name_embedding)::double precision, 
                   0
               ) AS advertiser_name_score
        FROM embedding_match
    ),
    date_match AS (
        -- Apply recency score based on first_shown date (more recent is better)
        SELECT advertiser_name_match.*, 
               EXTRACT(EPOCH FROM (NOW() - advertiser_name_match.first_shown)) / (60 * 60 * 24 * 365) AS year_diff,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - advertiser_name_match.first_shown)) < (60 * 60 * 24 * 365) 
                 THEN COALESCE(
                     1 - (EXTRACT(EPOCH FROM (NOW() - advertiser_name_match.first_shown)) / (60 * 60 * 24 * 365))::double precision, 
                     0
                   )
                 ELSE 0
               END AS date_score
        FROM advertiser_name_match
    ),
    spend_match AS (
        -- Normalize spend score based on min_spend (scale between 0 and 1)
        SELECT date_match.*, 
               CASE 
                 WHEN date_match.min_spend IS NOT NULL THEN
                   (date_match.min_spend / (SELECT MAX(min_spend) FROM public.int_ads__google_ads_enhanced))
                 ELSE 0 
               END AS spend_score
        FROM date_match
    ),
    impressions_match AS (
        -- Normalize impressions score based on min_impressions (scale between 0 and 1)
        SELECT spend_match.*, 
               CASE 
                 WHEN spend_match.min_impressions IS NOT NULL THEN
                   (spend_match.min_impressions / (SELECT MAX(min_impressions) FROM public.int_ads__google_ads_enhanced))
                 ELSE 0 
               END AS impressions_score
        FROM spend_match
    )
    -- Compute the final score as a weighted sum of individual scores
    SELECT 
        impressions_match.id, 
        impressions_match.advertisement_url, 
        impressions_match.advertiser_name, 
        impressions_match.advertiser_url, 
        impressions_match.first_shown, 
        impressions_match.last_shown, 
        impressions_match.days_ran_for, 
        impressions_match.format, 
        impressions_match.content, 
        impressions_match.version, 
        impressions_match.targeted_ages, 
        impressions_match.gender_targeting, 
        impressions_match.geo_targeting, 
        impressions_match.keywords, 
        impressions_match.summary, 
        impressions_match.political_leaning, 
        impressions_match.tone, 
        impressions_match.min_spend, 
        impressions_match.max_spend, 
        impressions_match.min_impressions, 
        impressions_match.max_impressions, 
        impressions_match.keyword_score, 
        impressions_match.leaning_score, 
        impressions_match.tones_score, 
        impressions_match.embedding_score, 
        impressions_match.date_score,
        impressions_match.advertiser_name_score,
        impressions_match.spend_score,
        impressions_match.impressions_score,
        COALESCE(
            (_weight_keyword * impressions_match.keyword_score 
             + _weight_leaning * impressions_match.leaning_score 
             + _weight_tones * impressions_match.tones_score 
             + _weight_embedding * impressions_match.embedding_score 
             + _weight_recency * impressions_match.date_score
             + _weight_advertiser_name * impressions_match.advertiser_name_score
             + _weight_spend * impressions_match.spend_score
             + _weight_impressions * impressions_match.impressions_score)::double precision, 
            0
        ) AS final_score
    FROM impressions_match
    ORDER BY final_score DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_ads_advanced(_keywords text[], _embedding vector, _leaning text[], _tones text[], _alpha double precision DEFAULT 0.25, _beta double precision DEFAULT 0.20, _gamma double precision DEFAULT 0.10, _delta double precision DEFAULT 0.35, _epsilon double precision DEFAULT 0.10)
 RETURNS TABLE(id uuid, advertisement_url text, advertiser_name text, advertiser_url text, first_shown date, last_shown date, days_ran_for integer, format text, content text, version integer, targeted_ages text[], gender_targeting jsonb, geo_targeting jsonb, keywords text[], summary text, political_leaning text, tone text[], keyword_score integer, leaning_score integer, tones_score integer, embedding_score double precision, date_score double precision, final_score double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH distance_mapping AS (
        -- Define distances for political leanings
        SELECT 
            'Unknown' AS leaning, 0 AS distance UNION ALL
            SELECT 'Faith and Flag Conservatives', 1 UNION ALL
            SELECT 'Committed Conservatives', 2 UNION ALL
            SELECT 'Populist Right', 3 UNION ALL
            SELECT 'Ambivalent Right', 4 UNION ALL
            SELECT 'Moderate', 5 UNION ALL
            SELECT 'Outsider Left', 6 UNION ALL
            SELECT 'Democratic Mainstays', 7 UNION ALL
            SELECT 'Establishment Liberals', 8 UNION ALL
            SELECT 'Progressive Left', 9
    ),
    keyword_match AS (
        -- Count the number of matching keywords
        SELECT a.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(a.keywords) 
                           INTERSECT 
                           SELECT unnest(_keywords)
                       ), 1
                   ), 0
               ) AS keyword_score
        FROM public.int_ads__google_ads_enhanced a
    ),
    leaning_match AS (
        -- Compute distance-based leaning score
        SELECT keyword_match.*, 
               COALESCE(
                   (SELECT MIN(ABS(d1.distance - d2.distance))
                    FROM distance_mapping d1, distance_mapping d2
                    WHERE d1.leaning = keyword_match.political_leaning
                    AND d2.leaning = ANY(_leaning)
                   ), 0
               ) AS leaning_score
        FROM keyword_match
    ),
    tones_match AS (
        -- Count the number of matching tones
        SELECT leaning_match.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(leaning_match.tone) 
                           INTERSECT 
                           SELECT unnest(_tones)
                       ), 1
                   ), 0
               ) AS tones_score
        FROM leaning_match
    ),
    embedding_match AS (
        -- Compute embedding score using cosine similarity
        SELECT tones_match.*, 
               COALESCE(
                   1 - (tones_match.summary_embeddings <=> _embedding)::double precision, 
                   0
               ) AS embedding_score
        FROM tones_match
    ),
    date_match AS (
        -- Apply recency score based on first_shown date (more recent is better)
        SELECT embedding_match.*, 
               EXTRACT(EPOCH FROM (NOW() - embedding_match.first_shown)) / (60 * 60 * 24 * 365) AS year_diff,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - embedding_match.first_shown)) < (60 * 60 * 24 * 365) 
                 THEN COALESCE(
                     1 - (EXTRACT(EPOCH FROM (NOW() - embedding_match.first_shown)) / (60 * 60 * 24 * 365))::double precision, 
                     0
                   )
                 ELSE 0
               END AS date_score
        FROM embedding_match
    )
    -- Compute the final score as a weighted sum of individual scores
    SELECT 
        date_match.id, 
        date_match.advertisement_url, 
        date_match.advertiser_name, 
        date_match.advertiser_url, 
        date_match.first_shown, 
        date_match.last_shown, 
        date_match.days_ran_for, 
        date_match.format, 
        date_match.content, 
        date_match.version, 
        date_match.targeted_ages, 
        date_match.gender_targeting, 
        date_match.geo_targeting, 
        date_match.keywords, 
        date_match.summary, 
        date_match.political_leaning, 
        date_match.tone, 
        date_match.keyword_score, 
        date_match.leaning_score, 
        date_match.tones_score, 
        date_match.embedding_score, 
        date_match.date_score,
        COALESCE(
            (_alpha * date_match.keyword_score 
             + _beta * date_match.leaning_score 
             + _gamma * date_match.tones_score 
             + _delta * date_match.embedding_score 
             + _epsilon * date_match.date_score)::double precision, 
            0
        ) AS final_score
    FROM date_match
    ORDER BY final_score DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_news_advanced(_keywords text[], _embedding vector, _leaning text[], _tones text[], _alpha double precision DEFAULT 0.25, _beta double precision DEFAULT 0.20, _gamma double precision DEFAULT 0.10, _delta double precision DEFAULT 0.35, _epsilon double precision DEFAULT 0.10)
 RETURNS TABLE(id uuid, source_url text, url text, title text, authors text[], publish_date timestamp with time zone, ai_summary text, political_keywords text[], political_leaning text, political_tones text[], issues text[], keyword_score integer, leaning_score integer, tones_score integer, embedding_score double precision, date_score double precision, final_score double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH distance_mapping AS (
        -- Define distances for political leanings
        SELECT 
            'Unknown' AS leaning, 0 AS distance UNION ALL
            SELECT 'Faith and Flag Conservatives', 1 UNION ALL
            SELECT 'Committed Conservatives', 2 UNION ALL
            SELECT 'Populist Right', 3 UNION ALL
            SELECT 'Ambivalent Right', 4 UNION ALL
            SELECT 'Moderate', 5 UNION ALL
            SELECT 'Outsider Left', 6 UNION ALL
            SELECT 'Democratic Mainstays', 7 UNION ALL
            SELECT 'Establishment Liberals', 8 UNION ALL
            SELECT 'Progressive Left', 9
    ),
    keyword_match AS (
        -- Count the number of matching keywords
        SELECT n.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(n.political_keywords) 
                           INTERSECT 
                           SELECT unnest(_keywords)
                       ), 1
                   ), 0
               ) AS keyword_score
        FROM public.int_news n
    ),
    leaning_match AS (
        -- Compute distance-based leaning score
        SELECT keyword_match.*, 
               COALESCE(
                   (SELECT MIN(ABS(d1.distance - d2.distance))
                    FROM distance_mapping d1, distance_mapping d2
                    WHERE d1.leaning = keyword_match.political_leaning
                    AND d2.leaning = ANY(_leaning)
                   ), 0
               ) AS leaning_score
        FROM keyword_match
    ),
    tones_match AS (
        -- Count the number of matching tones
        SELECT leaning_match.*, 
               COALESCE(
                   array_length(
                       ARRAY(
                           SELECT unnest(leaning_match.political_tones) 
                           INTERSECT 
                           SELECT unnest(_tones)
                       ), 1
                   ), 0
               ) AS tones_score
        FROM leaning_match
    ),
    embedding_match AS (
        -- Compute embedding score using cosine similarity
        SELECT tones_match.*, 
               COALESCE(
                   1 - (tones_match.summary_embedding <=> _embedding)::double precision, 
                   0
               ) AS embedding_score
        FROM tones_match
    ),
    date_match AS (
        -- Apply recency score based on publish date (more recent is better)
        SELECT embedding_match.*, 
               EXTRACT(EPOCH FROM (NOW() - embedding_match.publish_date)) / (60 * 60 * 24 * 365) AS year_diff,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - embedding_match.publish_date)) < (60 * 60 * 24 * 365) 
                 THEN COALESCE(
                     1 - (EXTRACT(EPOCH FROM (NOW() - embedding_match.publish_date)) / (60 * 60 * 24 * 365))::double precision, 
                     0
                   )
                 ELSE 0
               END AS date_score
        FROM embedding_match
    )
    -- Compute the final score as a weighted sum of individual scores
    SELECT 
        date_match.id, 
        date_match.source_url, 
        date_match.url, 
        date_match.title, 
        date_match.authors, 
        date_match.publish_date, 
        date_match.ai_summary, 
        date_match.political_keywords, 
        date_match.political_leaning, 
        date_match.political_tones, 
        date_match.issues, 
        date_match.keyword_score, 
        date_match.leaning_score, 
        date_match.tones_score, 
        date_match.embedding_score, 
        date_match.date_score,
        COALESCE(
            (_alpha * date_match.keyword_score 
             + _beta * date_match.leaning_score 
             + _gamma * date_match.tones_score 
             + _delta * date_match.embedding_score 
             + _epsilon * date_match.date_score)::double precision, 
            0
        ) AS final_score
    FROM date_match
    ORDER BY final_score DESC;
END;
$function$
;

CREATE OR REPLACE PROCEDURE public.update_enhanced_ads_table()
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    cur_row RECORD;
    v_min_spend INT;
    v_max_spend INT;
    v_min_impressions INT;
    v_max_impressions INT;
BEGIN
    FOR cur_row IN SELECT advertisement_url FROM int_ads__google_ads_enhanced LOOP
        -- Calculate min_spend and max_spend
        WITH spend_calc AS (
            SELECT
                CASE 
                    WHEN LOWER(spend) LIKE '%over%' THEN TRIM(SUBSTRING(REPLACE(spend, '(usd)', ''), 5))
                    ELSE TRIM(SPLIT_PART(REPLACE(spend, '(usd)', ''), '–', 1))
                END AS min_spend_value,
                CASE 
                    WHEN LOWER(spend) LIKE '%over%' THEN NULL
                    ELSE TRIM(SPLIT_PART(REPLACE(spend, '(usd)', ''), '–', 2))
                END AS max_spend_value
            FROM stg_ads__google_ads
            WHERE advertisement_url = cur_row.advertisement_url
        ),
        spend_parsed AS (
            SELECT
                SUBSTRING(min_spend_value, 2) AS min_spend_numeric,
                SUBSTRING(COALESCE(max_spend_value, ''), 2) AS max_spend_numeric,
                LOWER(RIGHT(min_spend_value, 1)) AS min_spend_suffix,
                LOWER(RIGHT(COALESCE(max_spend_value, ''), 1)) AS max_spend_suffix
            FROM spend_calc
        )
        SELECT
            CASE
                WHEN min_spend_suffix = 'k' THEN CAST(CAST(LEFT(min_spend_numeric, LENGTH(min_spend_numeric) - 1) AS DECIMAL) * 1000 AS INT)
                WHEN min_spend_suffix = 'm' THEN CAST(CAST(LEFT(min_spend_numeric, LENGTH(min_spend_numeric) - 1) AS DECIMAL) * 1000000 AS INT)
                WHEN min_spend_suffix = 'b' THEN CAST(CAST(LEFT(min_spend_numeric, LENGTH(min_spend_numeric) - 1) AS DECIMAL) * 1000000000 AS INT)
                ELSE CAST(min_spend_numeric AS INTEGER)
            END AS min_spend,
            CASE 
                WHEN max_spend_numeric = '' THEN NULL
                WHEN max_spend_suffix = 'k' THEN CAST(CAST(LEFT(max_spend_numeric, LENGTH(max_spend_numeric) - 1) AS DECIMAL) * 1000 AS INT)
                WHEN max_spend_suffix = 'm' THEN CAST(CAST(LEFT(max_spend_numeric, LENGTH(max_spend_numeric) - 1) AS DECIMAL) * 1000000 AS INT)
                WHEN max_spend_suffix = 'b' THEN CAST(CAST(LEFT(max_spend_numeric, LENGTH(max_spend_numeric) - 1) AS DECIMAL) * 1000000000 AS INT)
                ELSE CAST(max_spend_numeric AS INTEGER)
            END AS max_spend
        INTO v_min_spend, v_max_spend
        FROM spend_parsed;

        -- Calculate min_impressions and max_impressions
        WITH imp_calc AS (
            SELECT
                CASE 
                    WHEN LOWER(impressions) LIKE '%over%' THEN TRIM(SUBSTRING(impressions, 5))
                    ELSE TRIM(SPLIT_PART(impressions, '–', 1))
                END AS min_imp_value,
                CASE 
                    WHEN LOWER(impressions) LIKE '%over%' THEN NULL
                    ELSE TRIM(SPLIT_PART(impressions, '–', 2))
                END AS max_imp_value
            FROM stg_ads__google_ads
            WHERE advertisement_url = cur_row.advertisement_url
        ),
        imp_parsed AS (
            SELECT
                min_imp_value AS min_imp_numeric,
                COALESCE(max_imp_value, '') AS max_imp_numeric,
                LOWER(RIGHT(min_imp_value, 1)) AS min_imp_suffix,
                LOWER(RIGHT(COALESCE(max_imp_value, ''), 1)) AS max_imp_suffix
            FROM imp_calc
        )
        SELECT
            CASE 
                WHEN min_imp_suffix = 'k' THEN CAST(CAST(LEFT(min_imp_numeric, LENGTH(min_imp_numeric) - 1) AS DECIMAL) * 1000 AS INT)
                WHEN min_imp_suffix = 'm' THEN CAST(CAST(LEFT(min_imp_numeric, LENGTH(min_imp_numeric) - 1) AS DECIMAL) * 1000000 AS INT)
                WHEN min_imp_suffix = 'b' THEN CAST(CAST(LEFT(min_imp_numeric, LENGTH(min_imp_numeric) - 1) AS DECIMAL) * 1000000000 AS INT)
                ELSE CAST(min_imp_numeric AS INTEGER)
            END AS min_impressions,
            CASE 
                WHEN max_imp_numeric = '' THEN NULL
                WHEN max_imp_suffix = 'k' THEN CAST(CAST(LEFT(max_imp_numeric, LENGTH(max_imp_numeric) - 1) AS DECIMAL) * 1000 AS INT)
                WHEN max_imp_suffix = 'm' THEN CAST(CAST(LEFT(max_imp_numeric, LENGTH(max_imp_numeric) - 1) AS DECIMAL) * 1000000 AS INT)
                WHEN max_imp_suffix = 'b' THEN CAST(CAST(LEFT(max_imp_numeric, LENGTH(max_imp_numeric) - 1) AS DECIMAL) * 1000000000 AS INT)
                ELSE CAST(max_imp_numeric AS INTEGER)
            END AS max_impressions
        INTO v_min_impressions, v_max_impressions
        FROM imp_parsed;

        -- Update the enhanced table
        UPDATE int_ads__google_ads_enhanced
        SET 
            min_spend = v_min_spend,
            max_spend = v_max_spend,
            min_impressions = v_min_impressions,
            max_impressions = v_max_impressions
        WHERE advertisement_url = cur_row.advertisement_url;

    END LOOP;
END;
$procedure$
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
        advertiser_name_embedding,
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
        e.advertiser_name_embedding,
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."ad_taglines" to "anon";

grant insert on table "public"."ad_taglines" to "anon";

grant references on table "public"."ad_taglines" to "anon";

grant select on table "public"."ad_taglines" to "anon";

grant trigger on table "public"."ad_taglines" to "anon";

grant truncate on table "public"."ad_taglines" to "anon";

grant update on table "public"."ad_taglines" to "anon";

grant delete on table "public"."ad_taglines" to "authenticated";

grant insert on table "public"."ad_taglines" to "authenticated";

grant references on table "public"."ad_taglines" to "authenticated";

grant select on table "public"."ad_taglines" to "authenticated";

grant trigger on table "public"."ad_taglines" to "authenticated";

grant truncate on table "public"."ad_taglines" to "authenticated";

grant update on table "public"."ad_taglines" to "authenticated";

grant delete on table "public"."ad_taglines" to "service_role";

grant insert on table "public"."ad_taglines" to "service_role";

grant references on table "public"."ad_taglines" to "service_role";

grant select on table "public"."ad_taglines" to "service_role";

grant trigger on table "public"."ad_taglines" to "service_role";

grant truncate on table "public"."ad_taglines" to "service_role";

grant update on table "public"."ad_taglines" to "service_role";

grant delete on table "public"."ai_ads_data" to "anon";

grant insert on table "public"."ai_ads_data" to "anon";

grant references on table "public"."ai_ads_data" to "anon";

grant select on table "public"."ai_ads_data" to "anon";

grant trigger on table "public"."ai_ads_data" to "anon";

grant truncate on table "public"."ai_ads_data" to "anon";

grant update on table "public"."ai_ads_data" to "anon";

grant delete on table "public"."ai_ads_data" to "authenticated";

grant insert on table "public"."ai_ads_data" to "authenticated";

grant references on table "public"."ai_ads_data" to "authenticated";

grant select on table "public"."ai_ads_data" to "authenticated";

grant trigger on table "public"."ai_ads_data" to "authenticated";

grant truncate on table "public"."ai_ads_data" to "authenticated";

grant update on table "public"."ai_ads_data" to "authenticated";

grant delete on table "public"."ai_ads_data" to "service_role";

grant insert on table "public"."ai_ads_data" to "service_role";

grant references on table "public"."ai_ads_data" to "service_role";

grant select on table "public"."ai_ads_data" to "service_role";

grant trigger on table "public"."ai_ads_data" to "service_role";

grant truncate on table "public"."ai_ads_data" to "service_role";

grant update on table "public"."ai_ads_data" to "service_role";

grant delete on table "public"."ai_conversations_data" to "anon";

grant insert on table "public"."ai_conversations_data" to "anon";

grant references on table "public"."ai_conversations_data" to "anon";

grant select on table "public"."ai_conversations_data" to "anon";

grant trigger on table "public"."ai_conversations_data" to "anon";

grant truncate on table "public"."ai_conversations_data" to "anon";

grant update on table "public"."ai_conversations_data" to "anon";

grant delete on table "public"."ai_conversations_data" to "authenticated";

grant insert on table "public"."ai_conversations_data" to "authenticated";

grant references on table "public"."ai_conversations_data" to "authenticated";

grant select on table "public"."ai_conversations_data" to "authenticated";

grant trigger on table "public"."ai_conversations_data" to "authenticated";

grant truncate on table "public"."ai_conversations_data" to "authenticated";

grant update on table "public"."ai_conversations_data" to "authenticated";

grant delete on table "public"."ai_conversations_data" to "service_role";

grant insert on table "public"."ai_conversations_data" to "service_role";

grant references on table "public"."ai_conversations_data" to "service_role";

grant select on table "public"."ai_conversations_data" to "service_role";

grant trigger on table "public"."ai_conversations_data" to "service_role";

grant truncate on table "public"."ai_conversations_data" to "service_role";

grant update on table "public"."ai_conversations_data" to "service_role";

grant delete on table "public"."ai_query_suggestions" to "anon";

grant insert on table "public"."ai_query_suggestions" to "anon";

grant references on table "public"."ai_query_suggestions" to "anon";

grant select on table "public"."ai_query_suggestions" to "anon";

grant trigger on table "public"."ai_query_suggestions" to "anon";

grant truncate on table "public"."ai_query_suggestions" to "anon";

grant update on table "public"."ai_query_suggestions" to "anon";

grant delete on table "public"."ai_query_suggestions" to "authenticated";

grant insert on table "public"."ai_query_suggestions" to "authenticated";

grant references on table "public"."ai_query_suggestions" to "authenticated";

grant select on table "public"."ai_query_suggestions" to "authenticated";

grant trigger on table "public"."ai_query_suggestions" to "authenticated";

grant truncate on table "public"."ai_query_suggestions" to "authenticated";

grant update on table "public"."ai_query_suggestions" to "authenticated";

grant delete on table "public"."ai_query_suggestions" to "service_role";

grant insert on table "public"."ai_query_suggestions" to "service_role";

grant references on table "public"."ai_query_suggestions" to "service_role";

grant select on table "public"."ai_query_suggestions" to "service_role";

grant trigger on table "public"."ai_query_suggestions" to "service_role";

grant truncate on table "public"."ai_query_suggestions" to "service_role";

grant update on table "public"."ai_query_suggestions" to "service_role";

grant delete on table "public"."ai_suggestions_data" to "anon";

grant insert on table "public"."ai_suggestions_data" to "anon";

grant references on table "public"."ai_suggestions_data" to "anon";

grant select on table "public"."ai_suggestions_data" to "anon";

grant trigger on table "public"."ai_suggestions_data" to "anon";

grant truncate on table "public"."ai_suggestions_data" to "anon";

grant update on table "public"."ai_suggestions_data" to "anon";

grant delete on table "public"."ai_suggestions_data" to "authenticated";

grant insert on table "public"."ai_suggestions_data" to "authenticated";

grant references on table "public"."ai_suggestions_data" to "authenticated";

grant select on table "public"."ai_suggestions_data" to "authenticated";

grant trigger on table "public"."ai_suggestions_data" to "authenticated";

grant truncate on table "public"."ai_suggestions_data" to "authenticated";

grant update on table "public"."ai_suggestions_data" to "authenticated";

grant delete on table "public"."ai_suggestions_data" to "service_role";

grant insert on table "public"."ai_suggestions_data" to "service_role";

grant references on table "public"."ai_suggestions_data" to "service_role";

grant select on table "public"."ai_suggestions_data" to "service_role";

grant trigger on table "public"."ai_suggestions_data" to "service_role";

grant truncate on table "public"."ai_suggestions_data" to "service_role";

grant update on table "public"."ai_suggestions_data" to "service_role";

grant delete on table "public"."int_news" to "anon";

grant insert on table "public"."int_news" to "anon";

grant references on table "public"."int_news" to "anon";

grant select on table "public"."int_news" to "anon";

grant trigger on table "public"."int_news" to "anon";

grant truncate on table "public"."int_news" to "anon";

grant update on table "public"."int_news" to "anon";

grant delete on table "public"."int_news" to "authenticated";

grant insert on table "public"."int_news" to "authenticated";

grant references on table "public"."int_news" to "authenticated";

grant select on table "public"."int_news" to "authenticated";

grant trigger on table "public"."int_news" to "authenticated";

grant truncate on table "public"."int_news" to "authenticated";

grant update on table "public"."int_news" to "authenticated";

grant delete on table "public"."int_news" to "service_role";

grant insert on table "public"."int_news" to "service_role";

grant references on table "public"."int_news" to "service_role";

grant select on table "public"."int_news" to "service_role";

grant trigger on table "public"."int_news" to "service_role";

grant truncate on table "public"."int_news" to "service_role";

grant update on table "public"."int_news" to "service_role";

grant delete on table "public"."int_threads" to "anon";

grant insert on table "public"."int_threads" to "anon";

grant references on table "public"."int_threads" to "anon";

grant select on table "public"."int_threads" to "anon";

grant trigger on table "public"."int_threads" to "anon";

grant truncate on table "public"."int_threads" to "anon";

grant update on table "public"."int_threads" to "anon";

grant delete on table "public"."int_threads" to "authenticated";

grant insert on table "public"."int_threads" to "authenticated";

grant references on table "public"."int_threads" to "authenticated";

grant select on table "public"."int_threads" to "authenticated";

grant trigger on table "public"."int_threads" to "authenticated";

grant truncate on table "public"."int_threads" to "authenticated";

grant update on table "public"."int_threads" to "authenticated";

grant delete on table "public"."int_threads" to "service_role";

grant insert on table "public"."int_threads" to "service_role";

grant references on table "public"."int_threads" to "service_role";

grant select on table "public"."int_threads" to "service_role";

grant trigger on table "public"."int_threads" to "service_role";

grant truncate on table "public"."int_threads" to "service_role";

grant update on table "public"."int_threads" to "service_role";

grant delete on table "public"."stg_news" to "anon";

grant insert on table "public"."stg_news" to "anon";

grant references on table "public"."stg_news" to "anon";

grant select on table "public"."stg_news" to "anon";

grant trigger on table "public"."stg_news" to "anon";

grant truncate on table "public"."stg_news" to "anon";

grant update on table "public"."stg_news" to "anon";

grant delete on table "public"."stg_news" to "authenticated";

grant insert on table "public"."stg_news" to "authenticated";

grant references on table "public"."stg_news" to "authenticated";

grant select on table "public"."stg_news" to "authenticated";

grant trigger on table "public"."stg_news" to "authenticated";

grant truncate on table "public"."stg_news" to "authenticated";

grant update on table "public"."stg_news" to "authenticated";

grant delete on table "public"."stg_news" to "service_role";

grant insert on table "public"."stg_news" to "service_role";

grant references on table "public"."stg_news" to "service_role";

grant select on table "public"."stg_news" to "service_role";

grant trigger on table "public"."stg_news" to "service_role";

grant truncate on table "public"."stg_news" to "service_role";

grant update on table "public"."stg_news" to "service_role";

CREATE TRIGGER update_timestamp BEFORE UPDATE ON public.int_news FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.int_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


