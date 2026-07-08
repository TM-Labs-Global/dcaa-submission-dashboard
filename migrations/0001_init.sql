-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text UNIQUE NOT NULL,
  "password_hash" text,
  "role" text NOT NULL DEFAULT 'viewer',
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now()
);

-- Create invites table
CREATE TABLE IF NOT EXISTS "invites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text,
  "token" text UNIQUE NOT NULL,
  "created_by" uuid REFERENCES "users"("id"),
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

-- Create form_daily_stats table
CREATE TABLE IF NOT EXISTS "form_daily_stats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id" text NOT NULL,
  "date" date NOT NULL,
  "signups" integer,
  "source" text NOT NULL,
  UNIQUE("form_id", "date")
);

-- Create sync_logs table
CREATE TABLE IF NOT EXISTS "sync_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id" text,
  "sync_type" text NOT NULL,
  "status" text NOT NULL,
  "error_message" text,
  "ran_at" timestamp DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_form_daily_stats_form_id_date" ON "form_daily_stats"("form_id", "date");
CREATE INDEX IF NOT EXISTS "idx_sync_logs_form_id" ON "sync_logs"("form_id");
CREATE INDEX IF NOT EXISTS "idx_invites_token" ON "invites"("token");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
