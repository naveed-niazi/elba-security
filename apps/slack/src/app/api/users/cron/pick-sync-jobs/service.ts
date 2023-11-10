import { env } from '@/common/env';
import { db } from '@/database/client';
import { usersSyncJobs } from '@/database/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { SlackAPIClient } from 'slack-web-api-client';

export const pickUsersSyncJobs = async () => {
  const job = await db.query.usersSyncJobs.findFirst({
    columns: {
      id: true,
      teamId: true,
      batchSize: true,
      syncStartedAt: true,
      isFirstSync: true,
      retries: true,
      paginationToken: true,
    },
    where: (syncJob, { eq }) => eq(syncJob.status, 'scheduled'),
    orderBy: [desc(usersSyncJobs.isFirstSync), asc(usersSyncJobs.syncStartedAt)],
  });

  if (!job) {
    console.log('no job');
    return new NextResponse('no job');
  }

  console.log(job);

  // TODO: try catch inc retries
  const slackWebClient = new SlackAPIClient(env.REMOVE_ME_SLACK_OAUTH_TOKEN);
  const { members, ok, response_metadata } = await slackWebClient.users.list({
    limit: job.batchSize,
    cursor: job.paginationToken || undefined,
  });
  if (!ok || !members) {
    console.log('FAILED');
    await db
      .update(usersSyncJobs)
      .set(job.retries < 3 ? { retries: job.retries + 1 } : { status: 'cancelled' })
      .where(eq(usersSyncJobs.id, job.id));

    return new NextResponse('failed');
    // throw new Error('An error occurred');
  }

  const users: { id: string; email: string; fullName?: string }[] = [];
  for (const member of members) {
    if (!member.deleted && !member.is_bot && member.profile?.email && member.id) {
      users.push({
        id: member.id,
        email: member.profile.email,
        fullName: member.real_name,
      });
    }
  }

  const nextPaginationToken = response_metadata?.next_cursor;
  await db.transaction(async (tx) => {
    await tx.delete(usersSyncJobs).where(eq(usersSyncJobs.id, job.id));

    if (nextPaginationToken) {
      console.log('INSERT');
      await tx.insert(usersSyncJobs).values({
        teamId: job.teamId,
        batchSize: job.batchSize,
        isFirstSync: job.isFirstSync,
        status: 'scheduled',
        syncStartedAt: job.syncStartedAt,
        paginationToken: nextPaginationToken,
      });
    }
  });

  return NextResponse.json(users);
};
