import { NextRequest, NextResponse } from 'next/server';

import { getOrCreateRequestId } from '../../../lib/api-request';
import { getOllamaHealth } from '../../../lib/ollama';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Deployment smoke / monitoring: no secrets, no internal Ollama URL.
 * Use after Vercel deploy: GET /api/health
 */
export async function GET(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const ollama = await getOllamaHealth();
  const res = NextResponse.json({
    ok: true,
    service: 'secaiplus-webapp',
    time: new Date().toISOString(),
    requestId,
    ollama: {
      available: ollama.available,
      model: ollama.model,
      modelInstalled: ollama.modelInstalled,
      installedModels: ollama.installedModels,
      error: ollama.error,
    },
  });
  res.headers.set('X-Request-ID', requestId);
  return res;
}
