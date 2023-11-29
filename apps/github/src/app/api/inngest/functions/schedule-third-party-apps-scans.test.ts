import { expect, test, describe } from 'vitest';
import { Installation, db } from '@/database';
import { scheduleThirdPartyAppsScans } from './schedule-third-party-apps-scans';
import { mockFunction } from './__mocks__/inngest';

const installationIds = Array.from({ length: 5 }, (_, i) => i);
const installations = installationIds.map((id) => ({
  id,
  elbaOrganizationId: `45a76301-f1dd-4a77-b12f-9d7d3fca3c9${id}`,
  accountId: 10 + id,
  accountLogin: `login-${id}`,
}));

describe('schedule-third-party-apps-scans', () => {
  test('should not schedule any jobs when there are no installation', async () => {
    const { result, step } = mockFunction(scheduleThirdPartyAppsScans);
    await expect(result).resolves.toStrictEqual({ installationIds: [] });
    expect(step.sendEvent).toBeCalledTimes(0);
  });

  test('should schedule jobs when there are installations', async () => {
    await db.insert(Installation).values(installations);
    const { result, step } = mockFunction(scheduleThirdPartyAppsScans);

    await expect(result).resolves.toStrictEqual({
      installationIds,
    });

    expect(step.sendEvent).toBeCalledTimes(1);
    expect(step.sendEvent).toBeCalledWith(
      'run-third-party-apps-scan',
      installations.map((installation) => ({
        name: 'third-party-apps/scan',
        data: { installationId: installation.id, isFirstScan: false },
      }))
    );
  });
});