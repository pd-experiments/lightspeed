ALTER TABLE "public"."outline_elements"
ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();
