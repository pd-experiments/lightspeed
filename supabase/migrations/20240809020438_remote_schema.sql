create type "public"."govtType" as enum ('FEDERAL', 'STATE', 'LOCAL');

alter table "public"."compliance_docs" add column "title" text;

alter table "public"."compliance_docs" add column "type" "govtType";

alter table "public"."outline" alter column "full_script" set data type jsonb using "full_script"::jsonb;


