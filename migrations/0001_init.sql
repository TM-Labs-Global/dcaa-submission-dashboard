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
