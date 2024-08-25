create table "public"."int_ads__google_ads_enhanced" (
    "id" uuid not null,
    "advertisement_url" text not null,
    "advertiser_name" text,
    "advertiser_url" text,
    "first_shown" date,
    "last_shown" date,
    "days_ran_for" integer,
    "format" text,
    "content" text,
    "version" integer,
    "age_targeting" jsonb,
    "gender_targeting" jsonb,
    "geo_targeting" jsonb,
    "keywords" text[],
    "summary" text,
    "political_leaning" text
);

CREATE UNIQUE INDEX int_ads__google_ads_enhanced_pkey ON public.int_ads__google_ads_enhanced USING btree (id);

alter table "public"."int_ads__google_ads_enhanced" add constraint "int_ads__google_ads_enhanced_pkey" PRIMARY KEY using index "int_ads__google_ads_enhanced_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.trigger_update_int_ads__google_ads_enhanced()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Delete from the enhanced table if a row is deleted
    IF TG_OP = 'DELETE' THEN
        DELETE FROM int_ads__google_ads_enhanced
        WHERE id = OLD.id;

        RETURN OLD;
    END IF;

    -- Upsert the row into the enhanced table
    INSERT INTO int_ads__google_ads_enhanced (
        id,
        advertisement_url,
        advertiser_name,
        advertiser_url,
        first_shown,
        last_shown,
        days_ran_for,
        format,
        content,
        version,
        age_targeting,
        gender_targeting,
        geo_targeting,
        keywords,
        summary,
        political_leaning
    )
    SELECT
        v.id AS id,
        v.advertisement_url,
        v.advertiser_name,
        v.advertiser_url,
        v.first_shown,
        v.last_shown,
        v.days_ran_for,
        v.format,
        v.content,
        v.version,
        v.age_targeting,
        v.gender_targeting,
        v.geo_targeting,
        e.keywords,
        e.summary,
        e.political_leaning
    FROM
        int_ads__google_ads_versioned v
    LEFT JOIN
        int_ads__google_ads_embeddings e
    ON
        v.id = e.versioned_ad_id
    WHERE
        v.id = NEW.id;

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."int_ads__google_ads_enhanced" to "anon";

grant insert on table "public"."int_ads__google_ads_enhanced" to "anon";

grant references on table "public"."int_ads__google_ads_enhanced" to "anon";

grant select on table "public"."int_ads__google_ads_enhanced" to "anon";

grant trigger on table "public"."int_ads__google_ads_enhanced" to "anon";

grant truncate on table "public"."int_ads__google_ads_enhanced" to "anon";

grant update on table "public"."int_ads__google_ads_enhanced" to "anon";

grant delete on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant insert on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant references on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant select on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant trigger on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant truncate on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant update on table "public"."int_ads__google_ads_enhanced" to "authenticated";

grant delete on table "public"."int_ads__google_ads_enhanced" to "service_role";

grant insert on table "public"."int_ads__google_ads_enhanced" to "service_role";

grant references on table "public"."int_ads__google_ads_enhanced" to "service_role";

grant select on table "public"."int_ads__google_ads_enhanced" to "service_role";

grant trigger on table "public"."int_ads__google_ads_enhanced" to "service_role";

grant truncate on table "public"."int_ads__google_ads_enhanced" to "service_role";

grant update on table "public"."int_ads__google_ads_enhanced" to "service_role";

CREATE TRIGGER trg_update_int_ads__google_ads_enhanced AFTER INSERT OR DELETE OR UPDATE ON public.int_ads__google_ads_embeddings FOR EACH ROW EXECUTE FUNCTION trigger_update_int_ads__google_ads_enhanced();

CREATE TRIGGER trg_update_int_ads__google_ads_enhanced AFTER INSERT OR DELETE OR UPDATE ON public.int_ads__google_ads_versioned FOR EACH ROW EXECUTE FUNCTION trigger_update_int_ads__google_ads_enhanced();


