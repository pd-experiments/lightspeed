create table "public"."int_ads__google_ads_embeddings" (
    "versioned_ad_id" uuid not null,
    "keywords" text[] not null,
    "summary" text not null,
    "political_leaning" text
);


CREATE UNIQUE INDEX int_ads__google_ads_embeddings_pkey ON public.int_ads__google_ads_embeddings USING btree (versioned_ad_id);

alter table "public"."int_ads__google_ads_embeddings" add constraint "int_ads__google_ads_embeddings_pkey" PRIMARY KEY using index "int_ads__google_ads_embeddings_pkey";

alter table "public"."int_ads__google_ads_embeddings" add constraint "fk_versioned_ad_id" FOREIGN KEY (versioned_ad_id) REFERENCES int_ads__google_ads_versioned(id) ON DELETE CASCADE not valid;

alter table "public"."int_ads__google_ads_embeddings" validate constraint "fk_versioned_ad_id";

grant delete on table "public"."int_ads__google_ads_embeddings" to "anon";

grant insert on table "public"."int_ads__google_ads_embeddings" to "anon";

grant references on table "public"."int_ads__google_ads_embeddings" to "anon";

grant select on table "public"."int_ads__google_ads_embeddings" to "anon";

grant trigger on table "public"."int_ads__google_ads_embeddings" to "anon";

grant truncate on table "public"."int_ads__google_ads_embeddings" to "anon";

grant update on table "public"."int_ads__google_ads_embeddings" to "anon";

grant delete on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant insert on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant references on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant select on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant trigger on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant truncate on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant update on table "public"."int_ads__google_ads_embeddings" to "authenticated";

grant delete on table "public"."int_ads__google_ads_embeddings" to "service_role";

grant insert on table "public"."int_ads__google_ads_embeddings" to "service_role";

grant references on table "public"."int_ads__google_ads_embeddings" to "service_role";

grant select on table "public"."int_ads__google_ads_embeddings" to "service_role";

grant trigger on table "public"."int_ads__google_ads_embeddings" to "service_role";

grant truncate on table "public"."int_ads__google_ads_embeddings" to "service_role";

grant update on table "public"."int_ads__google_ads_embeddings" to "service_role";


