import { NextResponse, type NextRequest } from 'next/server';
import { parseWebhookEventData } from '@elba-security/sdk';
import { handleThirdPartyAppsSyncRequested } from './service';

export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest) => {
  const eventData: unknown = await req.json();
  const { organisationId } = parseWebhookEventData('third_party_apps.scan_triggered', eventData);

  const result = await handleThirdPartyAppsSyncRequested(organisationId);

  return NextResponse.json(result);
};
