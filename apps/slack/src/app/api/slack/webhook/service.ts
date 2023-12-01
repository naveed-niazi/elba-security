import fs from 'node:fs';
import type { BasicSlackEvent, EnvelopedEvent, SlackEvent } from '@slack/bolt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isRequestSignedBySlack } from '@/repositories/slack/utils';
import { inngest } from '@/inngest/client';
import { env } from '@/common/env';

export const handleSlackWebhookMessage = async (request: NextRequest) => {
  console.log('------ NEW EVENT ------');
  const textBody = await request.clone().text();
  await fs.promises.appendFile(
    env.REMOVE_ME_WEBHOOK_LOG_FILE,
    `${new Date().toISOString()}\n${textBody}\n`
  );

  const timestamp = Number(request.headers.get('x-slack-request-timestamp'));
  const signature = request.headers.get('x-slack-signature');
  if (!timestamp || !signature || Number.isNaN(timestamp)) {
    throw new Error('Missing timestamp or signature');
  }

  // Deny replay attacks by accepting request from less than 5 minutes ago
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60;
  if (timestamp < fiveMinutesAgo) {
    throw new Error('Request timestamp too old');
  }

  const [signatureVersion, slackSignature] = signature.split('=');

  // Only handle known versions
  if (signatureVersion !== 'v0') {
    throw new Error(`Unhandled signature version: ${signatureVersion}`);
  }

  if (!slackSignature) {
    throw new Error('No signature provided');
  }

  const isSigned = await isRequestSignedBySlack(slackSignature, timestamp, textBody);
  if (!isSigned) {
    throw new Error('Failed to verify slack signature');
  }

  const payload = (await request.json()) as
    | EnvelopedEvent<SlackEvent>
    | (BasicSlackEvent<'url_verification'> & { challenge: string });

  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // TODO: try catch etc

  await inngest.send({
    id: `slack-event-${payload.event_id}`, // We set the id to ignore duplicate events
    name: 'slack/webhook.handle',
    data: payload,
  });

  // await slackEventHandler(payload);

  return new NextResponse();
};
