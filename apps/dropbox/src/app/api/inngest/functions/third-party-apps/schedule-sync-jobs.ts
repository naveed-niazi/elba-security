import { inngest } from '@/common/clients/inngest';
import { getOrganisationsToSyncUsers } from '../common/data';

export const scheduleThirdPartyAppsSyncJobs = inngest.createFunction(
  { id: 'schedule-third-party-apps-sync-jobs' },
  { cron: '* * * * *' },
  async ({ step }) => {
    const organisations = await getOrganisationsToSyncUsers();
    if (organisations.length > 0) {
      await step.sendEvent(
        'sendEvent.run-third-party-apps-sync-jobs',
        organisations.map((organisation) => ({
          name: 'third-party-apps/run-sync-jobs',
          data: { ...organisation, isFirstScan: false },
        }))
      );
    }

    return { organisations };
  }
);
