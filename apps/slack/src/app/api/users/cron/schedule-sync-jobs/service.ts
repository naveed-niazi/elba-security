import { db } from '@/database/client';
import { NewUsersSyncJob, teams, usersSyncJobs } from '@/database/schema';

export const scheduleUsersSyncJobs = async () => {
  await db.insert(teams).values({ id: '1' }).onConflictDoNothing();
  const slackTeams = await db.query.teams.findMany();
  // const teams = [{ id: '1' }];

  // const usersSyncJobs: NewUsersSyncJob[] = teams.map(({ teamid }) => ({
  //   teamId,
  // }));
  await db
    .insert(usersSyncJobs)
    .values(
      slackTeams.map(({ id: teamId }) => ({
        teamId,
        syncStartedAt: new Date(),
        batchSize: 3,
        isFirstSync: false,
        status: 'scheduled' as const,
      }))
    )
    .onConflictDoNothing();
};
