import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { parseBody } from './validate';

const schema = z.object({
  name: z.string({ error: 'Name is required.' }).min(1, 'Name is required.'),
  age: z.number().int().optional(),
});

/** Stub a NextRequest whose .json() resolves to `body` (or throws for bad JSON). */
function mockReq(body: unknown, malformed = false): NextRequest {
  return {
    json: async () => {
      if (malformed) throw new SyntaxError('Unexpected token');
      return body;
    },
  } as unknown as NextRequest;
}

describe('parseBody', () => {
  it('returns typed data for a valid body', async () => {
    const res = await parseBody(mockReq({ name: 'Cable', age: 3 }), schema);
    expect(res).not.toBeInstanceOf(NextResponse);
    expect(res).toEqual({ data: { name: 'Cable', age: 3 } });
  });

  it('returns 400 with field errors for an invalid body', async () => {
    const res = await parseBody(mockReq({ age: 5 }), schema);
    expect(res).toBeInstanceOf(NextResponse);
    const r = res as NextResponse;
    expect(r.status).toBe(400);
    const json = await r.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('Name is required.');
    expect(json.errors).toEqual([{ path: 'name', message: 'Name is required.' }]);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await parseBody(mockReq(null, true), schema);
    expect(res).toBeInstanceOf(NextResponse);
    const r = res as NextResponse;
    expect(r.status).toBe(400);
    const json = await r.json();
    expect(json.message).toBe('Invalid JSON body.');
  });
});
