import { NextResponse } from 'next/server';

export function apiError(error: unknown, message = 'Internal server error', status = 500) {
  console.error(`[API Error] ${message}:`, error);
  return NextResponse.json(
    { error: message, details: String(error) },
    { status }
  );
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = 'Resource not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function serviceUnavailable(message = 'Service unavailable') {
  return NextResponse.json({ error: message }, { status: 503 });
}
