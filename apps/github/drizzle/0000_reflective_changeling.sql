CREATE TABLE IF NOT EXISTS "installation" (
	"id" integer PRIMARY KEY NOT NULL,
	"elba_organisation_id" uuid NOT NULL,
	"account_id" integer,
	"account_login" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "installation_elba_organisation_id_unique" UNIQUE("elba_organisation_id"),
	CONSTRAINT "installation_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "installation_admin" (
	"installation_id" integer NOT NULL,
	"admin_id" text NOT NULL,
	"last_sync_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "installation_admin_installation_id_admin_id_unique" UNIQUE("installation_id","admin_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organisation_id_idx" ON "installation" ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "elba_organization_id_idx" ON "installation" ("elba_organisation_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "installation_admin" ADD CONSTRAINT "installation_admin_installation_id_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "installation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;