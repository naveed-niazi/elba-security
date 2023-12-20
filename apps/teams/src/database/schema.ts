import { uuid, integer, text, timestamp, pgTable, unique } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';

export const OrganisationOriginal = pgTable('organisation', {
  id: uuid('organisation_id').primaryKey(),
  installationId: integer('id').unique().notNull(),
  accountLogin: text('account_login').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const Organisation = pgTable('organisation', {
  id: uuid('organisation_id').primaryKey(),
  access_token: text('access_token').notNull(),
  refresh_token: text('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SelectOrganisation = InferSelectModel<typeof Organisation>;

export const Admin = pgTable(
  'admin',
  {
    id: text('id').notNull().primaryKey(),
    organisationId: uuid('organisation_id')
      .references(() => Organisation.id, { onDelete: 'cascade' })
      .notNull(),
    lastSyncAt: timestamp('last_sync_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    unq: unique().on(t.organisationId, t.id),
  })
);
