alter table "public"."todos" alter column "user" set not null;

alter table "public"."todos" alter column "user" set data type "simpleUserType" using "user"::"simpleUserType";


