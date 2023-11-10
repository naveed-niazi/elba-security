import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};

export async function POST() {
  return new NextResponse(null, { status: 501, statusText: 'Not Implemented' });
}
