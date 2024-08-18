create type "public"."outlineStatus" as enum ('INITIALIZED', 'EDITING', 'GENERATING', 'SCRIPT_FINALIZED', 'COMPLIANCE_CHECK', 'PERSONALIZATION');

alter table "public"."outline" add column "status" "outlineStatus";


