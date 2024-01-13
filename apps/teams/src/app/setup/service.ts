import { db } from '@/database/client';
import { inngest } from '@/inngest/client';
import { Organisation } from '@/database/schema';

export const setupOrganisation = async (
  organisationId: string,
  accessToken: string,
  refreshToken: string
) => {
  const [organisation] = await db
    .insert(Organisation)
    .values({
      id: organisationId,
      accessToken,
      refreshToken,
    })
    .returning();

  if (!organisation) {
    throw new Error(`Could not setup organisation with id=${organisationId}`);
  }

  await inngest.send({
    name: 'users/page_sync.requested',
    data: {
      organisationId,
      accessToken,
      refreshToken,
      syncStartedAt: Date.now(),
      isFirstSync: true,
      cursor: null,
    },
  });

  return organisation;
};
