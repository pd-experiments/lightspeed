create table "public"."int_ads__google_ads_versioned" (
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
    "geo_targeting" jsonb
);


create table "public"."stg_ads__google_ads" (
    "advertisement_url" text not null,
    "advertiser_name" text,
    "advertiser_url" text,
    "properties" jsonb,
    "age_targeting" jsonb,
    "gender_targeting" jsonb,
    "geo_targeting" jsonb,
    "media_links" text[],
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP
);


create table "public"."stg_ads__google_ads_links" (
    "advertisement_url" text not null,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP
);


alter table "public"."tiktok_comments" add column "embedding" vector;

alter table "public"."tiktok_videos" add column "embedding" vector;

CREATE UNIQUE INDEX int_ads__google_ads_versioned_pkey ON public.int_ads__google_ads_versioned USING btree (id);

CREATE UNIQUE INDEX stg_ads__google_ads_links_pkey ON public.stg_ads__google_ads_links USING btree (advertisement_url);

CREATE UNIQUE INDEX stg_ads__google_ads_pkey ON public.stg_ads__google_ads USING btree (advertisement_url);

alter table "public"."int_ads__google_ads_versioned" add constraint "int_ads__google_ads_versioned_pkey" PRIMARY KEY using index "int_ads__google_ads_versioned_pkey";

alter table "public"."stg_ads__google_ads" add constraint "stg_ads__google_ads_pkey" PRIMARY KEY using index "stg_ads__google_ads_pkey";

alter table "public"."stg_ads__google_ads_links" add constraint "stg_ads__google_ads_links_pkey" PRIMARY KEY using index "stg_ads__google_ads_links_pkey";

alter table "public"."int_ads__google_ads_versioned" add constraint "fk_advertisement_url" FOREIGN KEY (advertisement_url) REFERENCES stg_ads__google_ads(advertisement_url) ON DELETE CASCADE not valid;

alter table "public"."int_ads__google_ads_versioned" validate constraint "fk_advertisement_url";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.trigger_update_int_ads__google_ads_versioned()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- If the row is being deleted
    IF TG_OP = 'DELETE' THEN
        DELETE FROM int_ads__google_ads_versioned
        WHERE advertisement_url = OLD.advertisement_url;
        RETURN OLD;
    END IF;

    -- If the row is being inserted or updated
    DELETE FROM int_ads__google_ads_versioned
    WHERE advertisement_url = NEW.advertisement_url;

    INSERT INTO int_ads__google_ads_versioned
    WITH ran_for_labels AS (
      SELECT
        NEW.advertisement_url,
        CAST((REGEXP_MATCHES(prop->>'value', '(\d+) day', 'g'))[1] AS INTEGER) AS days_ran_for
      FROM stg_ads__google_ads AS ads,
        jsonb_array_elements(ads.properties) AS prop
      WHERE ads.advertisement_url = NEW.advertisement_url
        AND prop->>'label' = 'ran_for'
    ),

    first_last_dates AS (
        SELECT
            NEW.advertisement_url,
            TO_DATE(MAX(CASE WHEN prop->>'label' = 'first_shown' THEN prop->>'value' END), 'Mon DD, YYYY') AS first_shown,
            TO_DATE(MAX(CASE WHEN prop->>'label' = 'last_shown' THEN prop->>'value' END), 'Mon DD, YYYY') AS last_shown,
            MAX(CASE WHEN prop->>'label' = 'format' THEN prop->>'value' END) AS format
        FROM stg_ads__google_ads AS ads
        CROSS JOIN jsonb_array_elements(ads.properties) AS prop
        WHERE ads.advertisement_url = NEW.advertisement_url
        GROUP BY ads.advertisement_url
    ),

    unnested_media_content_with_versions AS (
      SELECT
        NEW.advertisement_url,
        media_item.content,
        media_item.version
      FROM stg_ads__google_ads AS ads,
      UNNEST(ads.media_links) WITH ORDINALITY AS media_item(content, version)
      WHERE ads.advertisement_url = NEW.advertisement_url
    ),

    ads_with_valid_links AS (
      SELECT
        NEW.advertisement_url
      FROM stg_ads__google_ads AS ads
      WHERE ads.advertisement_url = NEW.advertisement_url
        AND array_length(coalesce(ads.media_links, '{}'), 1) > 0
    )

    SELECT
      gen_random_uuid() AS id,
      NEW.advertisement_url,
      NEW.advertiser_name,
      NEW.advertiser_url,
      first_last_dates.first_shown,
      first_last_dates.last_shown,
      ran_for_labels.days_ran_for,
      first_last_dates.format,
      unnested_media_content_with_versions.content,
      unnested_media_content_with_versions.version,
      NEW.age_targeting,
      NEW.gender_targeting,
      NEW.geo_targeting
    FROM stg_ads__google_ads AS ads
    INNER JOIN ads_with_valid_links ON ads.advertisement_url = ads_with_valid_links.advertisement_url
    INNER JOIN first_last_dates ON ads.advertisement_url = first_last_dates.advertisement_url
    INNER JOIN ran_for_labels ON ads.advertisement_url = ran_for_labels.advertisement_url
    INNER JOIN unnested_media_content_with_versions ON ads.advertisement_url = unnested_media_content_with_versions.advertisement_url;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_google_ads_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_int_ads__google_ads_versioned()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if the table exists, and create it if it doesn't
    PERFORM 1
    FROM information_schema.tables 
    WHERE table_name = 'int_ads__google_ads_versioned';

    IF NOT FOUND THEN
        CREATE TABLE int_ads__google_ads_versioned (
            id UUID PRIMARY KEY,
            advertisement_url TEXT NOT NULL,
            advertiser_name TEXT,
            advertiser_url TEXT,
            first_shown DATE,
            last_shown DATE,
            days_ran_for INTEGER,
            format TEXT,
            content TEXT,
            version INTEGER,
            age_targeting JSONB,
            gender_targeting JSONB,
            geo_targeting JSONB,
            CONSTRAINT fk_advertisement_url
              FOREIGN KEY(advertisement_url) 
              REFERENCES stg_ads__google_ads(advertisement_url)
              ON DELETE CASCADE
        );
    END IF;

    -- Delete the existing record(s) for this advertisement_url in the versioned table
    DELETE FROM int_ads__google_ads_versioned
    WHERE advertisement_url = OLD.advertisement_url;

    -- Insert new records for the updated or inserted advertisement_url
    INSERT INTO int_ads__google_ads_versioned
    WITH ran_for_labels AS (
      SELECT
        NEW.advertisement_url,
        CAST((REGEXP_MATCHES(prop->>'value', '(\d+) day', 'g'))[1] AS INTEGER) AS days_ran_for
      FROM stg_ads__google_ads AS ads,
        jsonb_array_elements(ads.properties) AS prop
      WHERE ads.advertisement_url = NEW.advertisement_url
        AND prop->>'label' = 'ran_for'
    ),

    first_last_dates AS (
        SELECT
            NEW.advertisement_url,
            TO_DATE(MAX(CASE WHEN prop->>'label' = 'first_shown' THEN prop->>'value' END), 'Mon DD, YYYY') AS first_shown,
            TO_DATE(MAX(CASE WHEN prop->>'label' = 'last_shown' THEN prop->>'value' END), 'Mon DD, YYYY') AS last_shown,
            MAX(CASE WHEN prop->>'label' = 'format' THEN prop->>'value' END) AS format
        FROM stg_ads__google_ads AS ads
        CROSS JOIN jsonb_array_elements(ads.properties) AS prop
        WHERE ads.advertisement_url = NEW.advertisement_url
        GROUP BY ads.advertisement_url
    ),

    unnested_media_content_with_versions AS (
      SELECT
        NEW.advertisement_url,
        media_item.content,
        media_item.version
      FROM stg_ads__google_ads AS ads,
      UNNEST(ads.media_links) WITH ORDINALITY AS media_item(content, version)
      WHERE ads.advertisement_url = NEW.advertisement_url
    ),

    ads_with_valid_links AS (
      SELECT
        NEW.advertisement_url
      FROM stg_ads__google_ads AS ads
      WHERE ads.advertisement_url = NEW.advertisement_url
        AND array_length(coalesce(ads.media_links, '{}'), 1) > 1
    )

    SELECT
      gen_random_uuid() AS id,
      NEW.advertisement_url,
      NEW.advertiser_name,
      NEW.advertiser_url,
      first_last_dates.first_shown,
      first_last_dates.last_shown,
      ran_for_labels.days_ran_for,
      first_last_dates.format,
      unnested_media_content_with_versions.content,
      unnested_media_content_with_versions.version,
      NEW.age_targeting,
      NEW.gender_targeting,
      NEW.geo_targeting
    FROM stg_ads__google_ads AS ads
    INNER JOIN ads_with_valid_links ON ads.advertisement_url = ads_with_valid_links.advertisement_url
    INNER JOIN first_last_dates ON ads.advertisement_url = first_last_dates.advertisement_url
    INNER JOIN ran_for_labels ON ads.advertisement_url = ran_for_labels.advertisement_url
    INNER JOIN unnested_media_content_with_versions ON ads.advertisement_url = unnested_media_content_with_versions.advertisement_url;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_stg_ads__google_ads_links_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_stg_ads__google_ads_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."int_ads__google_ads_versioned" to "anon";

grant insert on table "public"."int_ads__google_ads_versioned" to "anon";

grant references on table "public"."int_ads__google_ads_versioned" to "anon";

grant select on table "public"."int_ads__google_ads_versioned" to "anon";

grant trigger on table "public"."int_ads__google_ads_versioned" to "anon";

grant truncate on table "public"."int_ads__google_ads_versioned" to "anon";

grant update on table "public"."int_ads__google_ads_versioned" to "anon";

grant delete on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant insert on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant references on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant select on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant trigger on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant truncate on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant update on table "public"."int_ads__google_ads_versioned" to "authenticated";

grant delete on table "public"."int_ads__google_ads_versioned" to "service_role";

grant insert on table "public"."int_ads__google_ads_versioned" to "service_role";

grant references on table "public"."int_ads__google_ads_versioned" to "service_role";

grant select on table "public"."int_ads__google_ads_versioned" to "service_role";

grant trigger on table "public"."int_ads__google_ads_versioned" to "service_role";

grant truncate on table "public"."int_ads__google_ads_versioned" to "service_role";

grant update on table "public"."int_ads__google_ads_versioned" to "service_role";

grant delete on table "public"."stg_ads__google_ads" to "anon";

grant insert on table "public"."stg_ads__google_ads" to "anon";

grant references on table "public"."stg_ads__google_ads" to "anon";

grant select on table "public"."stg_ads__google_ads" to "anon";

grant trigger on table "public"."stg_ads__google_ads" to "anon";

grant truncate on table "public"."stg_ads__google_ads" to "anon";

grant update on table "public"."stg_ads__google_ads" to "anon";

grant delete on table "public"."stg_ads__google_ads" to "authenticated";

grant insert on table "public"."stg_ads__google_ads" to "authenticated";

grant references on table "public"."stg_ads__google_ads" to "authenticated";

grant select on table "public"."stg_ads__google_ads" to "authenticated";

grant trigger on table "public"."stg_ads__google_ads" to "authenticated";

grant truncate on table "public"."stg_ads__google_ads" to "authenticated";

grant update on table "public"."stg_ads__google_ads" to "authenticated";

grant delete on table "public"."stg_ads__google_ads" to "service_role";

grant insert on table "public"."stg_ads__google_ads" to "service_role";

grant references on table "public"."stg_ads__google_ads" to "service_role";

grant select on table "public"."stg_ads__google_ads" to "service_role";

grant trigger on table "public"."stg_ads__google_ads" to "service_role";

grant truncate on table "public"."stg_ads__google_ads" to "service_role";

grant update on table "public"."stg_ads__google_ads" to "service_role";

grant delete on table "public"."stg_ads__google_ads_links" to "anon";

grant insert on table "public"."stg_ads__google_ads_links" to "anon";

grant references on table "public"."stg_ads__google_ads_links" to "anon";

grant select on table "public"."stg_ads__google_ads_links" to "anon";

grant trigger on table "public"."stg_ads__google_ads_links" to "anon";

grant truncate on table "public"."stg_ads__google_ads_links" to "anon";

grant update on table "public"."stg_ads__google_ads_links" to "anon";

grant delete on table "public"."stg_ads__google_ads_links" to "authenticated";

grant insert on table "public"."stg_ads__google_ads_links" to "authenticated";

grant references on table "public"."stg_ads__google_ads_links" to "authenticated";

grant select on table "public"."stg_ads__google_ads_links" to "authenticated";

grant trigger on table "public"."stg_ads__google_ads_links" to "authenticated";

grant truncate on table "public"."stg_ads__google_ads_links" to "authenticated";

grant update on table "public"."stg_ads__google_ads_links" to "authenticated";

grant delete on table "public"."stg_ads__google_ads_links" to "service_role";

grant insert on table "public"."stg_ads__google_ads_links" to "service_role";

grant references on table "public"."stg_ads__google_ads_links" to "service_role";

grant select on table "public"."stg_ads__google_ads_links" to "service_role";

grant trigger on table "public"."stg_ads__google_ads_links" to "service_role";

grant truncate on table "public"."stg_ads__google_ads_links" to "service_role";

grant update on table "public"."stg_ads__google_ads_links" to "service_role";

CREATE TRIGGER stg_ads__google_ads_before_update BEFORE UPDATE ON public.stg_ads__google_ads FOR EACH ROW EXECUTE FUNCTION update_stg_ads__google_ads_updated_at();

CREATE TRIGGER trg_update_int_ads__google_ads_versioned AFTER INSERT OR DELETE OR UPDATE ON public.stg_ads__google_ads FOR EACH ROW EXECUTE FUNCTION trigger_update_int_ads__google_ads_versioned();

CREATE TRIGGER stg_ads__google_ads_links_before_update BEFORE UPDATE ON public.stg_ads__google_ads_links FOR EACH ROW EXECUTE FUNCTION update_stg_ads__google_ads_links_updated_at();


