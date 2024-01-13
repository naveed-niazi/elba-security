import { RedirectType, redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { env } from '@/env';
import { getTokens } from '@/connectors/auth';
import { setupOrganisation } from './service';

export async function GET(request: NextRequest): Promise<void> {
  let redirectUrl = '';
  try {
    const { code, organisationId } = validateRequest(request);
    const tokens = await getTokens(code);
    await setupOrganisation(organisationId, tokens.accessToken, tokens.refreshToken);
    redirectUrl = `${env.ELBA_REDIRECT_URL}?source=${env.ELBA_SOURCE_ID}&success=true`;
  } catch (error: unknown) {
    redirectUrl = `${env.ELBA_REDIRECT_URL}?source=${env.ELBA_SOURCE_ID}&error=true`;
  } finally {
    redirectTo(redirectUrl);
  }
}

function validateRequest(request: NextRequest): { code: string; organisationId: string } {
  const code = request.nextUrl.searchParams.get('code');
  const organisationId = request.cookies.get('organisation_id')?.value;

  if (!code || !organisationId) {
    throw new Error('Code or organisationId is missing.');
  }

  return { code, organisationId };
}

function redirectTo(url: string): void {
  redirect(url, RedirectType.replace);
}
