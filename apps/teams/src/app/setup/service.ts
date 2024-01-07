import { db } from '@/database/client';
import { inngest } from '@/inngest/client';
import { Organisation } from '@/database/schema';

export const setupOrganisation = async (
  organisationId: string,
  access_token: string,
  refresh_token: string
) => {
  const [organisation] = await db
    .insert(Organisation)
    .values({
      id: organisationId,
      access_token: access_token,
      refresh_token: refresh_token,
      createdAt: new Date(),
    })
    .returning();

  if (!organisation) {
    throw new Error(`Could not setup organisation with id=${organisationId}`);
  }

  await inngest.send({
    name: 'users/page_sync.requested',
    data: {
      organisationId,
      access_token: access_token,
      refresh_token: refresh_token,
      syncStartedAt: Date.now(),
      isFirstSync: true,
      cursor: null,
    },
  });

  return organisation;
};
