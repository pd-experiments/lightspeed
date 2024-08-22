create table "public"."int_ads__google_advertisers" (
    "advertiser_id" text not null,
    "advertiser_url" text not null,
    "advertiser_name" text not null
);


CREATE UNIQUE INDEX int_ads__google_advertisers_advertiser_url_key ON public.int_ads__google_advertisers USING btree (advertiser_url);

CREATE UNIQUE INDEX int_ads__google_advertisers_pkey ON public.int_ads__google_advertisers USING btree (advertiser_id);

alter table "public"."int_ads__google_advertisers" add constraint "int_ads__google_advertisers_pkey" PRIMARY KEY using index "int_ads__google_advertisers_pkey";

alter table "public"."int_ads__google_advertisers" add constraint "int_ads__google_advertisers_advertiser_url_key" UNIQUE using index "int_ads__google_advertisers_advertiser_url_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.trigger_update_int_ads__google_advertisers()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Extract the advertiser ID from the URL
    DECLARE
        advertiser_id TEXT;
    BEGIN
        -- Extract the advertiser ID from the advertiser_url
        SELECT (REGEXP_MATCHES(NEW.advertiser_url, '/advertiser/([^?]+)'))[1]
        INTO advertiser_id;

        -- If no valid ID is found, do not process further
        IF advertiser_id IS NULL THEN
            RETURN NULL;
        END IF;

        -- If the row is being deleted
        IF TG_OP = 'DELETE' THEN
            -- Delete from int_ads__google_advertisers only if no more references exist in stg_ads__google_ads
            IF NOT EXISTS (SELECT 1 FROM stg_ads__google_ads WHERE advertiser_url = OLD.advertiser_url) THEN
                DELETE FROM int_ads__google_advertisers WHERE advertiser_id = advertiser_id;
            END IF;
            RETURN OLD;
        END IF;

        -- If the row is being inserted or updated
        INSERT INTO int_ads__google_advertisers (advertiser_id, advertiser_url, advertiser_name)
        VALUES (advertiser_id, NEW.advertiser_url, NEW.advertiser_name)
        ON CONFLICT (advertiser_id) DO UPDATE
        SET advertiser_name = EXCLUDED.advertiser_name;

        RETURN NEW;
    END;
END;
$function$
;

grant delete on table "public"."int_ads__google_advertisers" to "anon";

grant insert on table "public"."int_ads__google_advertisers" to "anon";

grant references on table "public"."int_ads__google_advertisers" to "anon";

grant select on table "public"."int_ads__google_advertisers" to "anon";

grant trigger on table "public"."int_ads__google_advertisers" to "anon";

grant truncate on table "public"."int_ads__google_advertisers" to "anon";

grant update on table "public"."int_ads__google_advertisers" to "anon";

grant delete on table "public"."int_ads__google_advertisers" to "authenticated";

grant insert on table "public"."int_ads__google_advertisers" to "authenticated";

grant references on table "public"."int_ads__google_advertisers" to "authenticated";

grant select on table "public"."int_ads__google_advertisers" to "authenticated";

grant trigger on table "public"."int_ads__google_advertisers" to "authenticated";

grant truncate on table "public"."int_ads__google_advertisers" to "authenticated";

grant update on table "public"."int_ads__google_advertisers" to "authenticated";

grant delete on table "public"."int_ads__google_advertisers" to "service_role";

grant insert on table "public"."int_ads__google_advertisers" to "service_role";

grant references on table "public"."int_ads__google_advertisers" to "service_role";

grant select on table "public"."int_ads__google_advertisers" to "service_role";

grant trigger on table "public"."int_ads__google_advertisers" to "service_role";

grant truncate on table "public"."int_ads__google_advertisers" to "service_role";

grant update on table "public"."int_ads__google_advertisers" to "service_role";

CREATE TRIGGER trg_update_int_ads__google_advertisers AFTER INSERT OR DELETE OR UPDATE ON public.stg_ads__google_ads FOR EACH ROW EXECUTE FUNCTION trigger_update_int_ads__google_advertisers();


