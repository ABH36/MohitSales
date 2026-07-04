import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserContext, requireRole } from './guard';

/** Minimal NextRequest stub exposing only headers.get (all guard reads). */
function mockReq(headers: Record<string, string>): NextRequest {
  return { headers: { get: (k: string) => headers[k] ?? null } } as unknown as NextRequest;
}

describe('getUserContext', () => {
  it('returns the userId + role injected by middleware', () => {
    const ctx = getUserContext(mockReq({ 'x-user-id': 'u1', 'x-user-role': 'ADMIN' }));
    expect(ctx).toEqual({ userId: 'u1', role: 'ADMIN' });
  });

  it('returns null when the auth headers are absent', () => {
    expect(getUserContext(mockReq({}))).toBeNull();
    expect(getUserContext(mockReq({ 'x-user-id': 'u1' }))).toBeNull();
  });
});

describe('requireRole', () => {
  it('returns the context when the role is allowed', () => {
    const res = requireRole(mockReq({ 'x-user-id': 'u1', 'x-user-role': 'EDITOR' }), ['ADMIN', 'EDITOR']);
    expect(res).not.toBeInstanceOf(NextResponse);
    expect(res).toMatchObject({ userId: 'u1', role: 'EDITOR' });
  });

  it('returns 403 when the role is not allowed', () => {
    const res = requireRole(mockReq({ 'x-user-id': 'u1', 'x-user-role': 'VIEWER' }), ['ADMIN', 'EDITOR']);
    expect(res).toBeInstanceOf(NextResponse);
    expect((res as NextResponse).status).toBe(403);
  });

  it('returns 401 when there is no authenticated context', () => {
    const res = requireRole(mockReq({}), ['ADMIN']);
    expect(res).toBeInstanceOf(NextResponse);
    expect((res as NextResponse).status).toBe(401);
  });
});
