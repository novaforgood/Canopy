alter table "public"."user" add column "attributes" jsonb
 not null default jsonb_build_object();
