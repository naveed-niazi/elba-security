import { db } from '@/database/client';
import { Organisation } from '@/database/schema';
import { getToken } from '@/connectors/auth';
import { inngest } from '@/inngest/client';

export const setupOrganisation = async (organisationId: string, code: string) => {
  const { access_token: accessToken, workspace_id: workspaceId } = await getToken(code);

  await db
    .insert(Organisation)
    .values({
      id: organisationId,
      accessToken,
      workspaceId,
    })
    .onConflictDoUpdate({
      target: Organisation.id,
      set: {
        accessToken,
        workspaceId,
      },
    });

  await inngest.send({
    name: 'users/sync',
    data: {
      isFirstSync: true,
      organisationId,
      workspaceId,
      syncStartedAt: Date.now(),
      page: null,
    },
  });
};