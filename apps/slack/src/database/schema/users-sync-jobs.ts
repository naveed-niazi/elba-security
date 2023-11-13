import { relations } from 'drizzle-orm';
import { teams } from './teams';
import {
  integer,
  pgEnum,
  pgTable,
  uniqueIndex,
  text,
  boolean,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// declaring enum in database
export const statusEnum = pgEnum('status', ['scheduled', 'started', 'cancelled']);

export const usersSyncJobs = pgTable(
  'users_sync_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: text('team_id')
      .notNull()
      // .primaryKey()
      .references(() => teams.id, { onDelete: 'cascade' }),
    batchSize: integer('batch_size').notNull(),
    paginationToken: text('pagination_token'),
    retries: integer('retries').notNull().default(0),
    syncStartedAt: timestamp('sync_started_at', { withTimezone: true }).notNull(),
    isFirstSync: boolean('is_first_sync').notNull(),
    status: statusEnum('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    // TODO: updated_at on update now
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (usersSyncJobs) => {
    return {
      nameIndex: uniqueIndex('team_id_idx').on(usersSyncJobs.teamId), // TODO: better naming
    };
  }
);

export type NewUsersSyncJob = typeof usersSyncJobs.$inferInsert;

export const usersSyncJobsRelations = relations(usersSyncJobs, ({ one }) => ({
  team: one(teams, {
    fields: [usersSyncJobs.teamId],
    references: [teams.id],
  }),
}));

// export const cities = pgTable('cities', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 256 }),
//   countryId: integer('country_id').references(() => countries.id),
//   popularity: popularityEnum('popularity'),
// });
