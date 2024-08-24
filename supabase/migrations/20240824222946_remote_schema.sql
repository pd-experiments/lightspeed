alter table "public"."ad_tests" drop column "test_config";

alter table "public"."ad_tests" add column "adset_id" text;

alter table "public"."ad_tests" add column "audience" text not null;

alter table "public"."ad_tests" add column "bid_strategy" text not null;

alter table "public"."ad_tests" add column "budget" numeric not null;

alter table "public"."ad_tests" add column "caption" text not null;

alter table "public"."ad_tests" add column "duration" integer not null;

alter table "public"."ad_tests" add column "image_url" text;

alter table "public"."ad_tests" add column "link" text not null;

alter table "public"."ad_tests" add column "placement" text not null;

alter table "public"."ad_tests" add column "platform" text not null;

alter table "public"."ad_tests" add column "version_id" text not null;

alter table "public"."ad_tests" add column "video_url" text;

CREATE UNIQUE INDEX unique_experiment_platform_version ON public.ad_tests USING btree (experiment_id, platform, version_id);

alter table "public"."ad_tests" add constraint "unique_experiment_platform_version" UNIQUE using index "unique_experiment_platform_version";


