alter table "public"."ad_experiments" alter column "status" drop default;

alter type "public"."ad_status" rename to "ad_status__old_version_to_be_dropped";

create type "public"."ad_status" as enum ('Draft', 'In Review', 'Active', 'Configured', 'Generating', 'Testing', 'Deployed');

alter table "public"."ad_experiments" alter column status type "public"."ad_status" using status::text::"public"."ad_status";

alter table "public"."ad_experiments" alter column "status" set default 'Draft'::ad_status;

drop type "public"."ad_status__old_version_to_be_dropped";


