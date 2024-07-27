create table "public"."outline" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text),
    "title" text,
    "description" text
);


create table "public"."outline_elements" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "outline_id" uuid default gen_random_uuid(),
    "video_embeddings" uuid[],
    "video_uuid" uuid default gen_random_uuid(),
    "start_timestamp" timestamp with time zone,
    "end_timestamp" timestamp with time zone
);


alter table "public"."outline_elements" enable row level security;

alter table "public"."youtube" add column "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text);

alter table "public"."youtube" add column "video_id" text;

alter table "public"."youtube" alter column "published_at" set data type date using "published_at"::date;

CREATE UNIQUE INDEX outline_elements_pkey ON public.outline_elements USING btree (id);

CREATE UNIQUE INDEX outline_pkey ON public.outline USING btree (id);

alter table "public"."outline" add constraint "outline_pkey" PRIMARY KEY using index "outline_pkey";

alter table "public"."outline_elements" add constraint "outline_elements_pkey" PRIMARY KEY using index "outline_elements_pkey";

alter table "public"."outline_elements" add constraint "outline_elements_outline_id_fkey" FOREIGN KEY (outline_id) REFERENCES outline(id) not valid;

alter table "public"."outline_elements" validate constraint "outline_elements_outline_id_fkey";

alter table "public"."outline_elements" add constraint "outline_elements_video_uuid_fkey" FOREIGN KEY (video_uuid) REFERENCES youtube(id) not valid;

alter table "public"."outline_elements" validate constraint "outline_elements_video_uuid_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_threshold double precision, match_count integer, video_uuid_specific uuid)
 RETURNS TABLE(video_uuid uuid, "timestamp" timestamp with time zone, text text, similarity double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    ve.video_uuid,
    ve."timestamp",
    ve.text,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM video_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
    AND ve.video_uuid = video_uuid_specific
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$
;

grant delete on table "public"."outline" to "anon";

grant insert on table "public"."outline" to "anon";

grant references on table "public"."outline" to "anon";

grant select on table "public"."outline" to "anon";

grant trigger on table "public"."outline" to "anon";

grant truncate on table "public"."outline" to "anon";

grant update on table "public"."outline" to "anon";

grant delete on table "public"."outline" to "authenticated";

grant insert on table "public"."outline" to "authenticated";

grant references on table "public"."outline" to "authenticated";

grant select on table "public"."outline" to "authenticated";

grant trigger on table "public"."outline" to "authenticated";

grant truncate on table "public"."outline" to "authenticated";

grant update on table "public"."outline" to "authenticated";

grant delete on table "public"."outline" to "service_role";

grant insert on table "public"."outline" to "service_role";

grant references on table "public"."outline" to "service_role";

grant select on table "public"."outline" to "service_role";

grant trigger on table "public"."outline" to "service_role";

grant truncate on table "public"."outline" to "service_role";

grant update on table "public"."outline" to "service_role";

grant delete on table "public"."outline_elements" to "anon";

grant insert on table "public"."outline_elements" to "anon";

grant references on table "public"."outline_elements" to "anon";

grant select on table "public"."outline_elements" to "anon";

grant trigger on table "public"."outline_elements" to "anon";

grant truncate on table "public"."outline_elements" to "anon";

grant update on table "public"."outline_elements" to "anon";

grant delete on table "public"."outline_elements" to "authenticated";

grant insert on table "public"."outline_elements" to "authenticated";

grant references on table "public"."outline_elements" to "authenticated";

grant select on table "public"."outline_elements" to "authenticated";

grant trigger on table "public"."outline_elements" to "authenticated";

grant truncate on table "public"."outline_elements" to "authenticated";

grant update on table "public"."outline_elements" to "authenticated";

grant delete on table "public"."outline_elements" to "service_role";

grant insert on table "public"."outline_elements" to "service_role";

grant references on table "public"."outline_elements" to "service_role";

grant select on table "public"."outline_elements" to "service_role";

grant trigger on table "public"."outline_elements" to "service_role";

grant truncate on table "public"."outline_elements" to "service_role";

grant update on table "public"."outline_elements" to "service_role";


