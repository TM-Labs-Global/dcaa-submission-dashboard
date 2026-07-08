-- Create form_subscribers table (individual subscriber records, per form)
CREATE TABLE IF NOT EXISTS "form_subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id" text NOT NULL,
  "sender_subscriber_id" text NOT NULL,
  "email" text NOT NULL,
  "first_name" text,
  "last_name" text,
  "location" text,
  "joined_at" timestamp NOT NULL,
  "synced_at" timestamp DEFAULT now(),
  UNIQUE("form_id", "sender_subscriber_id")
);

CREATE INDEX IF NOT EXISTS "idx_form_subscribers_form_id" ON "form_subscribers"("form_id");
CREATE INDEX IF NOT EXISTS "idx_form_subscribers_joined_at" ON "form_subscribers"("joined_at");
