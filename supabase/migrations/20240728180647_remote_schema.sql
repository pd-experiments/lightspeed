revoke delete on table "public"."frames" from "anon";

revoke insert on table "public"."frames" from "anon";

revoke references on table "public"."frames" from "anon";

revoke select on table "public"."frames" from "anon";

revoke trigger on table "public"."frames" from "anon";

revoke truncate on table "public"."frames" from "anon";

revoke update on table "public"."frames" from "anon";

revoke delete on table "public"."frames" from "authenticated";

revoke insert on table "public"."frames" from "authenticated";

revoke references on table "public"."frames" from "authenticated";

revoke select on table "public"."frames" from "authenticated";

revoke trigger on table "public"."frames" from "authenticated";

revoke truncate on table "public"."frames" from "authenticated";

revoke update on table "public"."frames" from "authenticated";

revoke delete on table "public"."frames" from "service_role";

revoke insert on table "public"."frames" from "service_role";

revoke references on table "public"."frames" from "service_role";

revoke select on table "public"."frames" from "service_role";

revoke trigger on table "public"."frames" from "service_role";

revoke truncate on table "public"."frames" from "service_role";

revoke update on table "public"."frames" from "service_role";

alter table "public"."frames" drop constraint "frames_video_uuid_fkey";

alter table "public"."frames" drop constraint "frames_pkey";

drop index if exists "public"."frames_pkey";

drop table "public"."frames";

create table "public"."frames_records" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "video_uuid" uuid default gen_random_uuid(),
    "video_id" text,
    "frame_number" text,
    "storage_path" text
);


alter table "public"."frames_records" enable row level security;

CREATE UNIQUE INDEX frames_pkey ON public.frames_records USING btree (id);

alter table "public"."frames_records" add constraint "frames_pkey" PRIMARY KEY using index "frames_pkey";

alter table "public"."frames_records" add constraint "frames_video_uuid_fkey" FOREIGN KEY (video_uuid) REFERENCES youtube(id) not valid;

alter table "public"."frames_records" validate constraint "frames_video_uuid_fkey";

grant delete on table "public"."frames_records" to "anon";

grant insert on table "public"."frames_records" to "anon";

grant references on table "public"."frames_records" to "anon";

grant select on table "public"."frames_records" to "anon";

grant trigger on table "public"."frames_records" to "anon";

grant truncate on table "public"."frames_records" to "anon";

grant update on table "public"."frames_records" to "anon";

grant delete on table "public"."frames_records" to "authenticated";

grant insert on table "public"."frames_records" to "authenticated";

grant references on table "public"."frames_records" to "authenticated";

grant select on table "public"."frames_records" to "authenticated";

grant trigger on table "public"."frames_records" to "authenticated";

grant truncate on table "public"."frames_records" to "authenticated";

grant update on table "public"."frames_records" to "authenticated";

grant delete on table "public"."frames_records" to "service_role";

grant insert on table "public"."frames_records" to "service_role";

grant references on table "public"."frames_records" to "service_role";

grant select on table "public"."frames_records" to "service_role";

grant trigger on table "public"."frames_records" to "service_role";

grant truncate on table "public"."frames_records" to "service_role";

grant update on table "public"."frames_records" to "service_role";


