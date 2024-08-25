create type "public"."deployment_type" as enum ('Test', 'Standard');

revoke delete on table "public"."ad_tests" from "anon";

revoke insert on table "public"."ad_tests" from "anon";

revoke references on table "public"."ad_tests" from "anon";

revoke select on table "public"."ad_tests" from "anon";

revoke trigger on table "public"."ad_tests" from "anon";

revoke truncate on table "public"."ad_tests" from "anon";

revoke update on table "public"."ad_tests" from "anon";

revoke delete on table "public"."ad_tests" from "authenticated";

revoke insert on table "public"."ad_tests" from "authenticated";

revoke references on table "public"."ad_tests" from "authenticated";

revoke select on table "public"."ad_tests" from "authenticated";

revoke trigger on table "public"."ad_tests" from "authenticated";

revoke truncate on table "public"."ad_tests" from "authenticated";

revoke update on table "public"."ad_tests" from "authenticated";

revoke delete on table "public"."ad_tests" from "service_role";

revoke insert on table "public"."ad_tests" from "service_role";

revoke references on table "public"."ad_tests" from "service_role";

revoke select on table "public"."ad_tests" from "service_role";

revoke trigger on table "public"."ad_tests" from "service_role";

revoke truncate on table "public"."ad_tests" from "service_role";

revoke update on table "public"."ad_tests" from "service_role";

alter table "public"."ad_tests" drop constraint "ad_tests_experiment_id_fkey";

alter table "public"."ad_tests" drop constraint "unique_experiment_platform_version";

alter table "public"."ad_tests" drop constraint "ad_tests_pkey";

drop index if exists "public"."ad_tests_experiment_id_idx";

drop index if exists "public"."ad_tests_pkey";

drop index if exists "public"."unique_experiment_platform_version";

drop table "public"."ad_tests";

create table "public"."ad_deployments" (
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
    "adset_id" text,
    "type" deployment_type not null default 'Test'::deployment_type
);


CREATE INDEX ad_tests_experiment_id_idx ON public.ad_deployments USING btree (experiment_id);

CREATE UNIQUE INDEX ad_tests_pkey ON public.ad_deployments USING btree (id);

CREATE UNIQUE INDEX unique_experiment_platform_version ON public.ad_deployments USING btree (experiment_id, platform, version_id);

alter table "public"."ad_deployments" add constraint "ad_tests_pkey" PRIMARY KEY using index "ad_tests_pkey";

alter table "public"."ad_deployments" add constraint "ad_tests_experiment_id_fkey" FOREIGN KEY (experiment_id) REFERENCES ad_experiments(id) not valid;

alter table "public"."ad_deployments" validate constraint "ad_tests_experiment_id_fkey";

alter table "public"."ad_deployments" add constraint "unique_experiment_platform_version" UNIQUE using index "unique_experiment_platform_version";

grant delete on table "public"."ad_deployments" to "anon";

grant insert on table "public"."ad_deployments" to "anon";

grant references on table "public"."ad_deployments" to "anon";

grant select on table "public"."ad_deployments" to "anon";

grant trigger on table "public"."ad_deployments" to "anon";

grant truncate on table "public"."ad_deployments" to "anon";

grant update on table "public"."ad_deployments" to "anon";

grant delete on table "public"."ad_deployments" to "authenticated";

grant insert on table "public"."ad_deployments" to "authenticated";

grant references on table "public"."ad_deployments" to "authenticated";

grant select on table "public"."ad_deployments" to "authenticated";

grant trigger on table "public"."ad_deployments" to "authenticated";

grant truncate on table "public"."ad_deployments" to "authenticated";

grant update on table "public"."ad_deployments" to "authenticated";

grant delete on table "public"."ad_deployments" to "service_role";

grant insert on table "public"."ad_deployments" to "service_role";

grant references on table "public"."ad_deployments" to "service_role";

grant select on table "public"."ad_deployments" to "service_role";

grant trigger on table "public"."ad_deployments" to "service_role";

grant truncate on table "public"."ad_deployments" to "service_role";

grant update on table "public"."ad_deployments" to "service_role";


