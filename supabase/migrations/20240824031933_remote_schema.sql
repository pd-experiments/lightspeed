alter table "public"."ad_experiments" alter column "status" drop default;

alter type "public"."ad_status" rename to "ad_status__old_version_to_be_dropped";

create type "public"."ad_status" as enum ('Draft', 'In Review', 'Active', 'Generating', 'Testing', 'Deployed');

alter table "public"."ad_experiments" alter column status type "public"."ad_status" using status::text::"public"."ad_status";

alter table "public"."ad_experiments" alter column "status" set default 'Draft'::ad_status;

drop type "public"."ad_status__old_version_to_be_dropped";

alter table "public"."int_ads__google_ads_enhanced" add column "summary_embeddings" vector(1536);

CREATE INDEX idx_summary_embeddings ON public.int_ads__google_ads_enhanced USING ivfflat (summary_embeddings);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.int_ads__google_ads_enhanced__semantic_search(query_embedding vector, match_threshold double precision)
 RETURNS SETOF int_ads__google_ads_enhanced
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT *
    FROM
        int_ads__google_ads_enhanced as e
    WHERE
        summary_embeddings <#> query_embedding < -match_threshold
    ORDER BY
        summary_embeddings <#> query_embedding;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_threshold double precision)
 RETURNS SETOF int_ads__google_ads_enhanced
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        e.id as row_id,
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
        summary_embeddings,
        political_leaning,
        tone
    FROM
        int_ads__google_ads_enhanced as e
    WHERE
        summary_embeddings <#> query_embedding > match_threshold
    ORDER BY
        summary_embeddings <#> query_embedding DESC;
END;
$function$
;

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
        summary_embeddings,
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
        v.targeted_ages,
        v.gender_targeting,
        v.geo_targeting,
        e.keywords,
        e.summary,
        e.summary_embeddings,
        e.political_leaning,
        e.tone
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

CREATE TRIGGER trg_update_int_ads__google_ads_enhanced AFTER INSERT OR DELETE OR UPDATE ON public.int_ads__google_ads_embeddings FOR EACH ROW EXECUTE FUNCTION trigger_update_int_ads__google_ads_enhanced();

CREATE TRIGGER trg_update_int_ads__google_ads_enhanced AFTER INSERT OR DELETE OR UPDATE ON public.int_ads__google_ads_versioned FOR EACH ROW EXECUTE FUNCTION trigger_update_int_ads__google_ads_enhanced();


