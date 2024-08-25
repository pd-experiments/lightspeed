create table "public"."ad_tests" (
    "id" uuid not null default uuid_generate_v4(),
    "experiment_id" uuid,
    "test_config" jsonb not null,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


CREATE INDEX ad_tests_experiment_id_idx ON public.ad_tests USING btree (experiment_id);

CREATE UNIQUE INDEX ad_tests_pkey ON public.ad_tests USING btree (id);

alter table "public"."ad_tests" add constraint "ad_tests_pkey" PRIMARY KEY using index "ad_tests_pkey";

alter table "public"."ad_tests" add constraint "ad_tests_experiment_id_fkey" FOREIGN KEY (experiment_id) REFERENCES ad_experiments(id) not valid;

alter table "public"."ad_tests" validate constraint "ad_tests_experiment_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."ad_tests" to "anon";

grant insert on table "public"."ad_tests" to "anon";

grant references on table "public"."ad_tests" to "anon";

grant select on table "public"."ad_tests" to "anon";

grant trigger on table "public"."ad_tests" to "anon";

grant truncate on table "public"."ad_tests" to "anon";

grant update on table "public"."ad_tests" to "anon";

grant delete on table "public"."ad_tests" to "authenticated";

grant insert on table "public"."ad_tests" to "authenticated";

grant references on table "public"."ad_tests" to "authenticated";

grant select on table "public"."ad_tests" to "authenticated";

grant trigger on table "public"."ad_tests" to "authenticated";

grant truncate on table "public"."ad_tests" to "authenticated";

grant update on table "public"."ad_tests" to "authenticated";

grant delete on table "public"."ad_tests" to "service_role";

grant insert on table "public"."ad_tests" to "service_role";

grant references on table "public"."ad_tests" to "service_role";

grant select on table "public"."ad_tests" to "service_role";

grant trigger on table "public"."ad_tests" to "service_role";

grant truncate on table "public"."ad_tests" to "service_role";

grant update on table "public"."ad_tests" to "service_role";


