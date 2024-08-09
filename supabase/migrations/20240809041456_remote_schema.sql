alter table "public"."outline" add column "compliance_doc" uuid;

alter table "public"."outline" add constraint "outline_compliance_doc_fkey" FOREIGN KEY (compliance_doc) REFERENCES compliance_docs(id) not valid;

alter table "public"."outline" validate constraint "outline_compliance_doc_fkey";


