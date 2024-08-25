create type "public"."deployment_status" as enum ('Created', 'Deployed', 'Running', 'Paused', 'Complete');

alter type "public"."ad_status" rename to "ad_status__old_version_to_be_dropped";

create type "public"."ad_status" as enum ('Draft', 'In Review', 'Configured', 'Generated');

create table "public"."ai_conversations_data" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "trending_topics" jsonb,
    "hot_issues" jsonb,
    "content_themes" jsonb,
    "influential_figures" jsonb,
    "news_articles" jsonb
);


alter table "public"."ad_creations" alter column status type "public"."ad_status" using status::text::"public"."ad_status";

drop type "public"."ad_status__old_version_to_be_dropped";

alter table "public"."ad_creations" alter column "status" drop default;

alter table "public"."ad_creations" alter column "status" drop not null;

alter table "public"."ad_deployments" alter column "status" set default 'Created'::deployment_status;

alter table "public"."ad_deployments" alter column "status" set data type deployment_status using "status"::deployment_status;

CREATE UNIQUE INDEX ai_conversations_data_pkey ON public.ai_conversations_data USING btree (id);

alter table "public"."ai_conversations_data" add constraint "ai_conversations_data_pkey" PRIMARY KEY using index "ai_conversations_data_pkey";

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


