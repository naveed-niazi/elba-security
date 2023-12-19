import { RedirectType, redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import type { NextRequest } from 'next/server';
import { env } from '@/env';
import { setupOrganisation } from './_service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const msalAuthCode = request.nextUrl.searchParams.get('code');
  console.log("msalAuthCode === ", msalAuthCode);

  // const rawInstallationId = request.nextUrl.searchParams.get('installation_id');
  // const organisationId = request.cookies.get('organisation_id')?.value;
  // const installationId = Number(rawInstallationId);

  // if (Number.isNaN(installationId) || rawInstallationId === null || !organisationId) {
  //   redirect(`${env.ELBA_REDIRECT_URL}?error=true`, RedirectType.replace);
  // }

  // try {
  //   await setupOrganisation(installationId, organisationId);
  //   redirect(env.ELBA_REDIRECT_URL, RedirectType.replace);
  // } catch (error) {
  //   if (isRedirectError(error)) {
  //     throw error;
  //   }
  //   redirect(`${env.ELBA_REDIRECT_URL}?error=true`, RedirectType.replace);
  // }
}
