import { pgTable, text } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: text('id').notNull().primaryKey(),
  elbaOrganisationId: text('elba_organisation_id').notNull(), // TODO: should the integration assume it's a uuid?
});
