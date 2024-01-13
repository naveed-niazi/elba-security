import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

export function GET() {
  cookies().set('organisation_id', env.ELBA_ORGANIZATION_ID);

  const redirectUrl = new URL(env.AZURE_AUTH_URL);
  redirectUrl.searchParams.append('response_type', 'code');
  redirectUrl.searchParams.append('scope', 'openid profile email offline_access');
  redirectUrl.searchParams.append('client_id', env.AZURE_AD_CLIENT_ID);
  redirectUrl.searchParams.append('redirect_uri', env.AZURE_AUTH_REDIRECT_URL);

  redirect(redirectUrl.toString());
}
