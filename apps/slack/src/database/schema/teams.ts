import { pgTable, text } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: text('id').notNull().primaryKey(),
});
