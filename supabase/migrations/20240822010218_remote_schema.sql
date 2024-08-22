alter table "public"."threads" drop constraint "threads_thread_id_key";

alter table "public"."threads" drop constraint "threads_pkey";

drop index if exists "public"."threads_pkey";

drop index if exists "public"."threads_thread_id_key";

alter table "public"."threads" drop column "full_name";

alter table "public"."threads" add column "embedding" vector;

alter table "public"."threads" add column "image_urls" text[];

alter table "public"."threads" add column "url" text;

alter table "public"."threads" add column "user_id" text;

alter table "public"."threads" add column "user_pk" text;

alter table "public"."threads" add column "user_profile_pic_url" text;

CREATE UNIQUE INDEX int_threads_pkey ON public.threads USING btree (id);

CREATE UNIQUE INDEX int_threads_thread_id_key ON public.threads USING btree (thread_id);

alter table "public"."threads" add constraint "int_threads_pkey" PRIMARY KEY using index "int_threads_pkey";

alter table "public"."threads" add constraint "int_threads_thread_id_key" UNIQUE using index "int_threads_thread_id_key";


