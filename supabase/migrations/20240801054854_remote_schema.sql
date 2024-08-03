create type "public"."outlineElementType" as enum ('VIDEO', 'TRANSITION');

alter table "public"."outline_elements" add column "description" text;

alter table "public"."outline_elements" add column "type" "outlineElementType";

alter table "public"."outline_elements" alter column "video_uuid" drop not null;


