create type "public"."todoStatusType" as enum ('TODO', 'IN_PROGRESS', 'DONE');

alter table "public"."todos" add column "status" "todoStatusType" not null default 'TODO'::"todoStatusType";


