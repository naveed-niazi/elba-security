import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  // const organisationId = request.nextUrl.searchParams.get('organisation_id');

  // if (!organisationId) {
  //   redirect(`${env.ELBA_REDIRECT_URL}?error=true`);
  // }

  cookies().set('organisation_id', env.ELBA_ORGANIZATION_ID);
  redirect(env.AZURE_AUTH_URL);
}
