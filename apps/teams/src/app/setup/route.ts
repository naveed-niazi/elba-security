import { RedirectType, redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/env';
import { setupOrganisation } from './_service';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const basicCode = request.nextUrl.searchParams.get('code');
    // const organisationId = env.ELBA_ORGANIZATION_ID
    const organisationId = request.cookies.get('organisation_id')?.value as string;

    console.log("organisationId ==== ", organisationId);

    const URL = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

    const requestBody = {
      grant_type: 'authorization_code',
      client_id: env.AZURE_AD_CLIENT_ID,
      client_secret: env.AZURE_AD_CLIENT_SECRET,
      code: basicCode,
      redirect_uri: env.AZURE_AUTH_REDIRECT_URL,
    };

    const result = await axios.post(URL, requestBody, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    console.log("result here ==== ", result.data);
    // return NextResponse.json(result.data);

    const { access_token, refresh_token } = result.data;
    if (!access_token || !refresh_token) {
      console.log("getting error | either access_token or refresh_token is missing");
      redirect(`${env.ELBA_REDIRECT_URL}?error=true`, RedirectType.replace);
    }

    console.log("setting up origanization");
    await setupOrganisation(organisationId, access_token, refresh_token);

    console.log("redirecting to elba_redirect_url");
    redirect(env.ELBA_REDIRECT_URL, RedirectType.replace);
  } catch (error) {
    console.log("error ==== ", error);
    // return NextResponse.json('Internal Server Error');
    if (isRedirectError(error)) {
      throw error;
    }
    redirect(`${env.ELBA_REDIRECT_URL}?error=true`, RedirectType.replace);
  }

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
