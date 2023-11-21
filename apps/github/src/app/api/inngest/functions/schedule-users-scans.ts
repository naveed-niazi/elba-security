import { env } from '@/env';
import { inngest, type FunctionHandler } from '../client';
import { getInstallationIds } from './data';

export const handler: FunctionHandler = async ({ step }) => {
  const installationIds = await getInstallationIds();

  if (installationIds.length > 0) {
    await step.sendEvent(
      'run-users-scan',
      installationIds.map((installationId) => ({
        name: 'users/scan',
        data: { installationId, isFirstScan: false },
      }))
    );
  }

  return { installationIds };
};

export const scheduleUsersScans = inngest.createFunction(
  { id: 'schedule-users-scans' },
  { cron: env.USERS_SYNC_CRON },
  handler
);
