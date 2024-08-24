create type "public"."ad_platform" as enum ('Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube');

create type "public"."ad_status" as enum ('Draft', 'In Review', 'Active');

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
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


CREATE UNIQUE INDEX ad_experiments_pkey ON public.ad_experiments USING btree (id);

alter table "public"."ad_experiments" add constraint "ad_experiments_pkey" PRIMARY KEY using index "ad_experiments_pkey";

set check_function_bodies = off;

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

CREATE TRIGGER update_ad_experiments_modtime BEFORE UPDATE ON public.ad_experiments FOR EACH ROW EXECUTE FUNCTION update_modified_column();


