revoke delete on table "public"."advertisements" from "anon";

revoke insert on table "public"."advertisements" from "anon";

revoke references on table "public"."advertisements" from "anon";

revoke select on table "public"."advertisements" from "anon";

revoke trigger on table "public"."advertisements" from "anon";

revoke truncate on table "public"."advertisements" from "anon";

revoke update on table "public"."advertisements" from "anon";

revoke delete on table "public"."advertisements" from "authenticated";

revoke insert on table "public"."advertisements" from "authenticated";

revoke references on table "public"."advertisements" from "authenticated";

revoke select on table "public"."advertisements" from "authenticated";

revoke trigger on table "public"."advertisements" from "authenticated";

revoke truncate on table "public"."advertisements" from "authenticated";

revoke update on table "public"."advertisements" from "authenticated";

revoke delete on table "public"."advertisements" from "service_role";

revoke insert on table "public"."advertisements" from "service_role";

revoke references on table "public"."advertisements" from "service_role";

revoke select on table "public"."advertisements" from "service_role";

revoke trigger on table "public"."advertisements" from "service_role";

revoke truncate on table "public"."advertisements" from "service_role";

revoke update on table "public"."advertisements" from "service_role";

alter table "public"."advertisements" drop constraint "advertisements_pkey";

drop index if exists "public"."advertisements_pkey";

drop table "public"."advertisements";

alter table "public"."int_ads__google_ads_embeddings" add column "tone" text[];

alter table "public"."int_ads__google_ads_enhanced" drop column "age_targeting";

alter table "public"."int_ads__google_ads_enhanced" add column "targeted_ages" text[];

alter table "public"."int_ads__google_ads_enhanced" add column "tone" text[];

alter table "public"."int_ads__google_ads_versioned" drop column "age_targeting";

alter table "public"."int_ads__google_ads_versioned" add column "targeted_ages" text[];

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
        targeted_ages,
        gender_targeting,
        geo_targeting,
        keywords,
        summary,
        political_leaning,
        tone
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
        v.targeted_ages,  -- Updated to use targeted_ages
        v.gender_targeting,
        v.geo_targeting,
        e.keywords,
        e.summary,
        e.political_leaning,
        e.tone  -- Added tone column
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


