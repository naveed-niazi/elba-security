import { expect, test, describe } from 'vitest';
import { scheduleThirdPartyAppsSyncJobs } from './schedule-sync-jobs';
import { mockInngestFunction } from '@/common/__mocks__/inngest';
import { insertOrganisations } from '@/common/__mocks__/token';

export const scheduledOrganisations = [
  {
    accessToken: 'access-token-0',
    organisationId: 'ce47f296-6d45-4405-ad2b-e279bec52620',
  },
  {
    accessToken: 'access-token-2',
    organisationId: 'ce47f296-6d45-4405-ad2b-e279bec52622',
  },
  {
    accessToken: 'access-token-1',
    organisationId: 'ce47f296-6d45-4405-ad2b-e279bec52621',
  },
];

describe('schedule-third-party-apps-sync-jobs', () => {
  test('should not schedule any jobs when there are no organisations', async () => {
    const { result, step } = mockInngestFunction(scheduleThirdPartyAppsSyncJobs);
    await expect(result).resolves.toStrictEqual({ organisations: [] });
    expect(step.sendEvent).toBeCalledTimes(0);
  });

  test.only('should schedule third party apps jobs when there are organisations to schedule', async () => {
    await insertOrganisations({
      size: 3,
    });

    const { result, step } = mockInngestFunction(scheduleThirdPartyAppsSyncJobs);

    await expect(result).resolves.toStrictEqual({
      organisations: expect.arrayContaining(scheduledOrganisations),
    });

    expect(step.sendEvent).toBeCalledTimes(1);
    expect(step.sendEvent).toBeCalledWith(
      'sendEvent.run-third-party-apps-sync-jobs',
      expect.arrayContaining(
        scheduledOrganisations.map((organisation) => ({
          name: 'third-party-apps/run-sync-jobs',
          data: { ...organisation, isFirstScan: false },
        }))
      )
    );
  });
});
