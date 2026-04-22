import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: true,
      data: { tokenExchange: 'not-required-cookie-auth' },
      timestamp: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
    },
    { status: 200 },
  );
  // TODO: confirm with backend - replace placeholder token exchange endpoint if realtime auth contract changes (ticket: FE-REALTIME-TOKEN-EXCHANGE)
}
