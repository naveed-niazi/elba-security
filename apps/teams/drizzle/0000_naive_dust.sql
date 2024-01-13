CREATE TABLE IF NOT EXISTS "organisation" (
    "id" uuid PRIMARY KEY NOT NULL,
    "access_token" text NOT NULL,
    "refresh_token" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);