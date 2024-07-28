create table "public"."frames" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "video_uuid" uuid default gen_random_uuid(),
    "video_id" text,
    "frame_number" text,
    "storage_path" text
);


alter table "public"."frames" enable row level security;

CREATE UNIQUE INDEX frames_pkey ON public.frames USING btree (id);

alter table "public"."frames" add constraint "frames_pkey" PRIMARY KEY using index "frames_pkey";

alter table "public"."frames" add constraint "frames_video_uuid_fkey" FOREIGN KEY (video_uuid) REFERENCES youtube(id) not valid;

alter table "public"."frames" validate constraint "frames_video_uuid_fkey";

grant delete on table "public"."frames" to "anon";

grant insert on table "public"."frames" to "anon";

grant references on table "public"."frames" to "anon";

grant select on table "public"."frames" to "anon";

grant trigger on table "public"."frames" to "anon";

grant truncate on table "public"."frames" to "anon";

grant update on table "public"."frames" to "anon";

grant delete on table "public"."frames" to "authenticated";

grant insert on table "public"."frames" to "authenticated";

grant references on table "public"."frames" to "authenticated";

grant select on table "public"."frames" to "authenticated";

grant trigger on table "public"."frames" to "authenticated";

grant truncate on table "public"."frames" to "authenticated";

grant update on table "public"."frames" to "authenticated";

grant delete on table "public"."frames" to "service_role";

grant insert on table "public"."frames" to "service_role";

grant references on table "public"."frames" to "service_role";

grant select on table "public"."frames" to "service_role";

grant trigger on table "public"."frames" to "service_role";

grant truncate on table "public"."frames" to "service_role";

grant update on table "public"."frames" to "service_role";


