import { inngest } from '@/common/clients/inngest';
import { DBXAccess } from '@/repositories/dropbox/clients';
import { handleError } from '../../handle-error';
import { formatThirdPartyObjects } from './utils/format-objects';
import { elbaAccess } from '@/common/clients/elba';

const handler: Parameters<typeof inngest.createFunction>[2] = async ({ event, step }) => {
  const { organisationId, accessToken, pagination } = event.data;

  if (!event.ts) {
    throw new Error('No timestamp');
  }

  const syncStartedAt = new Date(event.ts);

  const dbxAccess = new DBXAccess({
    accessToken,
  });

  const elba = elbaAccess(organisationId);

  const memberApps = await step
    .run('third-party-apps-sync-initialize', async () => {
      const {
        result: { apps, cursor, has_more: hasMore },
      } = await dbxAccess.teamLinkedAppsListMembersLinkedApps({
        cursor: pagination,
      });

      if (!apps.length) {
        return {
          nextCursor: cursor,
          hasMore,
        };
      }

      const thirdPartyAppsMap = formatThirdPartyObjects(apps);

      await elba.thirdPartyApps.updateObjects({
        apps: Array.from(thirdPartyAppsMap.values()),
      });

      return {
        nextCursor: cursor,
        hasMore,
      };
    })
    .catch(handleError);

  if (memberApps?.hasMore) {
    await step.sendEvent('sendEvent.third-party-apps/run-sync-jobs', {
      name: 'third-party-apps/run-sync-jobs',
      data: {
        ...event.data,
        pagination: memberApps.nextCursor,
      },
    });

    return {
      success: true,
    };
  }

  await step.run('third-party-apps-sync-finalize', async () => {
    return await elba.thirdPartyApps.deleteObjects({
      syncedBefore: new Date(syncStartedAt).toISOString(),
    });
  });

  return {
    success: true,
  };
};

export const runThirdPartyAppsSyncJobs = inngest.createFunction(
  {
    id: 'run-third-party-apps-sync-jobs',
    priority: {
      run: 'event.data.isFirstScan ? 600 : 0',
    },
    rateLimit: {
      limit: 1,
      key: 'event.data.organisationId',
      period: '1s',
    },
    retries: 10,
    concurrency: {
      limit: 1,
      key: 'event.data.organisationId',
    },
  },
  { event: 'third-party-apps/run-sync-jobs' },
  handler
);
