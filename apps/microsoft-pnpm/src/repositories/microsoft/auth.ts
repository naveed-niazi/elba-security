import { getTokenByTenantId } from '@/common/microsoft';
import { timeout } from '@/common/utils';
import { db } from '@/lib/db';
import { organizations } from '@/schemas/organization';

export const handleMicrosoftAuthCallback = async ({
  tenantId,
  isAdminConsentGiven,
}: {
  tenantId: string | null;
  isAdminConsentGiven: boolean;
}) => {
  if (!isAdminConsentGiven || !tenantId) {
    return 'You must give admin consent to continue';
  }
  const { scopes } = await getTokenByTenantId(tenantId);
  await timeout(10000);
  if (
    !scopes.includes('DelegatedPermissionGrant.ReadWrite.All') ||
    !scopes.includes('Application.ReadWrite.All') ||
    !scopes.includes('User.Read.All')
  ) {
    throw new Error("Couldn't retrieve required scopes");
  }
  try {
    await db.insert(organizations).values({ tenantId });
  } catch {
    return 'You have already given admin consent. You may close this window now.';
  }
  return 'You have successfully given admin consent. You may close this window now.';
};