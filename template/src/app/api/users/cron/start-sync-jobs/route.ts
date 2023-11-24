import { NextResponse } from 'next/server';

export const runtime = 'edge';

export function GET() {
  return new NextResponse(null, { status: 501, statusText: 'Not Implemented' });
}