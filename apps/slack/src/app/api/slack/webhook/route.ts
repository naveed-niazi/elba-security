import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/common/env';
import { handleSlackWebhookMessage } from './service';

export const runtime = 'edge';
export const preferredRegion = 'fra1';

export const POST = async (request: NextRequest) => {
  console.log('OK?');
  console.log('slack', env.SLACK_SIGNING_SECRET);
  // return new NextResponse('Hello');
  return handleSlackWebhookMessage(request);
};
