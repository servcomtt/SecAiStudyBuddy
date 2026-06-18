import type { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export function getOrCreateRequestId(request: NextRequest): string {
  const fromHeader = request.headers.get('x-request-id');
  if (fromHeader && /^[\w-]{8,128}$/.test(fromHeader.trim())) {
    return fromHeader.trim();
  }
  return randomUUID();
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) return realIp.trim();
  return 'unknown';
}

export function logRouteError(input: {
  requestId: string;
  path: string;
  method: string;
  error: unknown;
}) {
  const { requestId, path, method, error } = input;
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    level: 'error',
    requestId,
    path,
    method,
    message: err.message,
    name: err.name,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };
  console.error(JSON.stringify(payload));
}
