import { ApiReadinessSchema } from '@resonance/shared/schemas/health';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const configuredApiUrl = process.env.RESONANCE_API_URL;
  if (process.env.NODE_ENV === 'production' && !configuredApiUrl) {
    return Response.json({ status: 'unavailable' });
  }
  const apiUrl = configuredApiUrl ?? 'http://127.0.0.1:3000';

  try {
    const target = new URL('/health/ready', apiUrl);
    const response = await fetch(target, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    const readiness = ApiReadinessSchema.safeParse(await response.json());
    if (!readiness.success) {
      return Response.json({ status: 'unavailable' });
    }

    return Response.json(readiness.data);
  } catch {
    return Response.json({ status: 'unavailable' });
  }
}