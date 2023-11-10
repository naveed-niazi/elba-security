import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/common/env';
import { SlackAPIClient } from 'slack-web-api-client';

export const runtime = 'edge';
export const preferredRegion = 'fra1';

export const GET = async (request: NextRequest) => {
  const slackWebClient = new SlackAPIClient(env.REMOVE_ME_SLACK_OAUTH_TOKEN);
  const { members } = await slackWebClient.users.list({ limit: 200 });
  if (!members) {
    throw new Error('An error occurred');
  }

  const users = [];
  for (const member of members) {
    if (!member.deleted && !member.is_bot && member.profile?.email && member.id) {
      users.push({
        id: member.id,
        email: member.profile.email,
        fullName: member.real_name,
      });
    }
  }

  return NextResponse.json(users);
};
