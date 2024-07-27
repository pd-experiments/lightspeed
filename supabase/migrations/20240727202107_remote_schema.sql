alter table "public"."outline_elements" drop column "end_timestamp";

alter table "public"."outline_elements" drop column "start_timestamp";

alter table "public"."outline_elements" add column "position_end_time" timestamp with time zone;

alter table "public"."outline_elements" add column "position_start_time" timestamp with time zone;

alter table "public"."outline_elements" add column "video_end_time" timestamp with time zone not null;

alter table "public"."outline_elements" add column "video_start_time" timestamp with time zone not null;

alter table "public"."outline_elements" disable row level security;


