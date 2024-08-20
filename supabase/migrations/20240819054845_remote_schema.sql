create type "public"."platformType" as enum ('INSTAGRAM', 'SNAPCHAT', 'FACEBOOK', 'TIKTOK');

create table "public"."advertisements" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "image" text,
    "tagline" text,
    "caption" text,
    "description" text,
    "platform" "platformType"
);


CREATE UNIQUE INDEX advertisements_pkey ON public.advertisements USING btree (id);

alter table "public"."advertisements" add constraint "advertisements_pkey" PRIMARY KEY using index "advertisements_pkey";

grant delete on table "public"."advertisements" to "anon";

grant insert on table "public"."advertisements" to "anon";

grant references on table "public"."advertisements" to "anon";

grant select on table "public"."advertisements" to "anon";

grant trigger on table "public"."advertisements" to "anon";

grant truncate on table "public"."advertisements" to "anon";

grant update on table "public"."advertisements" to "anon";

grant delete on table "public"."advertisements" to "authenticated";

grant insert on table "public"."advertisements" to "authenticated";

grant references on table "public"."advertisements" to "authenticated";

grant select on table "public"."advertisements" to "authenticated";

grant trigger on table "public"."advertisements" to "authenticated";

grant truncate on table "public"."advertisements" to "authenticated";

grant update on table "public"."advertisements" to "authenticated";

grant delete on table "public"."advertisements" to "service_role";

grant insert on table "public"."advertisements" to "service_role";

grant references on table "public"."advertisements" to "service_role";

grant select on table "public"."advertisements" to "service_role";

grant trigger on table "public"."advertisements" to "service_role";

grant truncate on table "public"."advertisements" to "service_role";

grant update on table "public"."advertisements" to "service_role";


