create type "public"."deployment_status" as enum ('Created', 'Deployed', 'Running', 'Paused', 'Complete');

create type "public"."taglines_post_type" as enum ('Draft', 'Live', 'Archive');

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


