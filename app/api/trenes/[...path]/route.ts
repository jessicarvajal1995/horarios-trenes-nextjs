import { NextResponse } from 'next/server';
import { requestSofse } from '@/lib/sofse-api';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { path } = await context.params;
    const url = new URL(request.url);
    const sofsePath = `/${path.join('/')}`;
    const data = await requestSofse(sofsePath, url.searchParams);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo consultar SOFSE';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
