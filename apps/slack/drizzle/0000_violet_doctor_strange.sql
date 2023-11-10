DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('scheduled', 'started', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"batch_size" integer NOT NULL,
	"pagination_token" text,
	"retries" integer DEFAULT 0 NOT NULL,
	"sync_started_at" timestamp with time zone NOT NULL,
	"is_first_sync" boolean NOT NULL,
	"status" "status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "team_id_idx" ON "users_sync_jobs" ("team_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_sync_jobs" ADD CONSTRAINT "users_sync_jobs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
