create table "public"."news" (
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


alter table "public"."outline_elements" alter column "video_end_time" drop not null;

alter table "public"."outline_elements" alter column "video_id" drop not null;

alter table "public"."outline_elements" alter column "video_start_time" drop not null;

CREATE UNIQUE INDEX news_pkey ON public.news USING btree (id);

alter table "public"."news" add constraint "news_pkey" PRIMARY KEY using index "news_pkey";

grant delete on table "public"."news" to "anon";

grant insert on table "public"."news" to "anon";

grant references on table "public"."news" to "anon";

grant select on table "public"."news" to "anon";

grant trigger on table "public"."news" to "anon";

grant truncate on table "public"."news" to "anon";

grant update on table "public"."news" to "anon";

grant delete on table "public"."news" to "authenticated";

grant insert on table "public"."news" to "authenticated";

grant references on table "public"."news" to "authenticated";

grant select on table "public"."news" to "authenticated";

grant trigger on table "public"."news" to "authenticated";

grant truncate on table "public"."news" to "authenticated";

grant update on table "public"."news" to "authenticated";

grant delete on table "public"."news" to "service_role";

grant insert on table "public"."news" to "service_role";

grant references on table "public"."news" to "service_role";

grant select on table "public"."news" to "service_role";

grant trigger on table "public"."news" to "service_role";

grant truncate on table "public"."news" to "service_role";

grant update on table "public"."news" to "service_role";


