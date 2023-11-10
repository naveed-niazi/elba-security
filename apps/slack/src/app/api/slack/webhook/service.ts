import { isRequestSignedBySlack } from '@/repositories/slack/utils';
import { EnvelopedEvent, KnownEventFromType, SlackEvent } from '@slack/bolt';
import { NextRequest, NextResponse } from 'next/server';

type Handlers = {
  [EventType in SlackEvent['type']]: (
    teamId: string,
    event: KnownEventFromType<EventType>
  ) => Promise<void>;
};

const handlers: Partial<Handlers> = {
  message: async (teamId, event) => {
    console.log({ event });
    if (!event.subtype) {
      console.log({ text: event.text });
    }
  },
};

export const eventHandler = (teamId: string, event: SlackEvent) => {
  const { type } = event;
  const handler = handlers[type];
  if (!handler) {
    console.info({
      message: 'Slack event ignored',
      type,
      event,
    });
    return {
      message: `Event ignored: slack event handler not found for type ${type}`,
      type,
      event,
    };
  }

  handler(teamId, event as never);
};

export const handleSlackWebhookMessage = async (request: NextRequest) => {
  const payload: EnvelopedEvent | { type: 'url_verification'; challenge: string } = await request
    .clone()
    .json();
  const textBody = await request.text();

  const timestamp = Number(request.headers.get('x-slack-request-timestamp'));
  const signature = request.headers.get('x-slack-signature');
  if (!timestamp || !signature || Number.isNaN(timestamp)) {
    console.warn('Missing timestamp or signature');
    return false;
  }

  // Deny replay attacks by accepting request from less than 5 minutes ago
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60;
  if (timestamp < fiveMinutesAgo) {
    return false;
  }

  const [signatureVersion, slackSignature] = signature.split('=');

  // Only handle known versions
  if (signatureVersion !== 'v0') {
    console.warn(`[Slack] Unknown signature version: ${signatureVersion}`);
    return false;
  }

  const isSigned = await isRequestSignedBySlack(slackSignature, timestamp, textBody);

  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge });
  }

  const { event, team_id: teamId } = payload;

  await eventHandler(teamId, event as never);

  return new NextResponse();
};
