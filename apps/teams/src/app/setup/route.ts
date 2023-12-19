import { RedirectType, redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import type { NextRequest } from 'next/server';
import { env } from '@/env';
import { setupOrganisation } from './_service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const msalAuthCode = request.nextUrl.searchParams.get('code');
  console.log('msalAuthCode === ', msalAuthCode);

  const tokenEndpoint = `https://login.microsoftonline.com/2d8b8525-019f-4b55-9110-6c058df772eb/oauth2/v2.0/token`;
  const clientId = env.AZURE_AD_CLIENT_ID;
  const clientSecret = env.AZURE_AD_CLIENT_SECRET;
  const requestBody = `grant_type=authorization_code&code=${msalAuthCode}&redirect_uri=http://localhost:3000/setup&client_id=${clientId}&client_secret=${clientSecret}`;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  });

  const responseBody = await response.json();

  console.log("responseBody ==== ", responseBody);

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
