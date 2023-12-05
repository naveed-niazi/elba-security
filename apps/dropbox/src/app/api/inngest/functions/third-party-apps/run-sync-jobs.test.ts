import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { NonRetriableError, RetryAfterError } from 'inngest';
import { insertTestAccessToken } from '@/common/__mocks__/token';
import { DropboxResponseError } from 'dropbox';
import { mockInngestFunction } from '@/common/__mocks__/inngest';
import { runThirdPartyAppsSyncJobs } from './run-sync-jobs';
import { membersLinkedAppFirstPage } from './__mocks__/member-linked-apps';

const organisationId = 'b0771747-caf0-487d-a885-5bc3f1e9f770';

const mocks = vi.hoisted(() => {
  return {
    teamLinkedAppsListMembersLinkedApps: vi.fn(),
  };
});

// Mock Dropbox sdk
vi.mock('@/repositories/dropbox/clients/DBXAccess', () => {
  const actual = vi.importActual('dropbox');
  return {
    ...actual,
    DBXAccess: vi.fn(() => {
      return {
        setHeaders: vi.fn(() => {}),
        teamLinkedAppsListMembersLinkedApps: mocks.teamLinkedAppsListMembersLinkedApps,
      };
    }),
  };
});

describe('run-user-sync-jobs', async () => {
  beforeEach(async () => {
    mocks.teamLinkedAppsListMembersLinkedApps.mockReset();
  });

  beforeAll(async () => {
    vi.clearAllMocks();
  });

  test('should delay the job when Dropbox rate limit is reached', async () => {
    await insertTestAccessToken();

    mocks.teamLinkedAppsListMembersLinkedApps.mockRejectedValue(
      new DropboxResponseError(
        429,
        {
          'Retry-After': '5',
        },
        {
          error_summary: 'too_many_requests/...',
          error: {
            '.tag': 'too_many_requests',
          },
        }
      )
    );

    const { result } = mockInngestFunction(runThirdPartyAppsSyncJobs);

    await expect(result).rejects.toStrictEqual(
      new RetryAfterError('Dropbox rate limit reached', Number(5 * 1000))
    );
  });

  test("should not retry when the organisation's access token expired", async () => {
    await insertTestAccessToken();

    mocks.teamLinkedAppsListMembersLinkedApps.mockRejectedValue(
      new DropboxResponseError(
        401,
        {},
        {
          error_summary: 'expired_access_token/...',
          error: {
            '.tag': 'expired_access_token',
          },
        }
      )
    );

    const { result } = mockInngestFunction(runThirdPartyAppsSyncJobs);

    await expect(result).rejects.toStrictEqual(
      new NonRetriableError('Dropbox Access token is expired, you should re-authenticate the user')
    );
  });

  test('should call elba delete even if the members apps length is 0', async () => {
    mocks.teamLinkedAppsListMembersLinkedApps.mockImplementation(() => {
      return {
        result: {
          apps: [],
          has_more: false,
        },
      };
    });

    const { result } = mockInngestFunction(runThirdPartyAppsSyncJobs, {
      organisationId,
      refreshToken: 'test-refresh-token-0',
      pagination: undefined,
    });

    expect(await result).toStrictEqual({
      success: true,
    });
  });

  test('should fetch members apps send it tp elba(without pagination)', async () => {
    mocks.teamLinkedAppsListMembersLinkedApps.mockImplementation(() => {
      return {
        result: {
          cursor: 'cursor-1',
          has_more: false,
          apps: membersLinkedAppFirstPage,
        },
      };
    });

    const { result } = mockInngestFunction(runThirdPartyAppsSyncJobs, {
      organisationId,
      accessToken: 'access-token-1',
      pagination: undefined,
    });

    expect(await result).toStrictEqual({
      success: true,
    });
  });

  test('should fetch members apps send it tp elba(with pagination)', async () => {
    mocks.teamLinkedAppsListMembersLinkedApps.mockImplementation(() => {
      return {
        result: {
          cursor: 'cursor-1',
          has_more: true,
          apps: membersLinkedAppFirstPage,
        },
      };
    });

    const { result, step } = mockInngestFunction(runThirdPartyAppsSyncJobs, {
      organisationId,
      accessToken: 'access-token-1',
      pagination: undefined,
    });

    await expect(result).resolves.toStrictEqual({
      success: true,
    });

    // Call again to fetch the next page
    expect(step.sendEvent).toBeCalledTimes(1);
    expect(step.sendEvent).toBeCalledWith('sendEvent.third-party-apps/run-sync-jobs', {
      name: 'third-party-apps/run-sync-jobs',
      data: {
        organisationId,
        accessToken: 'access-token-1',
        pagination: 'cursor-1',
      },
    });

    expect(await result).toStrictEqual({
      success: true,
    });
  });
});
