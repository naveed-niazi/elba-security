import { uuid, text, pgTable } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';

export const Organisation = pgTable('organisation', {
  id: uuid('id').primaryKey(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
});

export type SelectOrganisation = InferSelectModel<typeof Organisation>;