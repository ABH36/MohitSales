import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

export interface FieldError {
  path: string;
  message: string;
}

/**
 * Parses and validates a JSON request body against a Zod schema.
 * Returns `{ data }` on success, or a `400` NextResponse carrying the first
 * error message plus a full `errors[]` list (matching the app's
 * `{ success, message }` envelope).
 *
 *   const parsed = await parseBody(request, productCreateSchema);
 *   if (parsed instanceof NextResponse) return parsed;
 *   const { data } = parsed; // fully typed
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodType<T>
): Promise<{ data: T } | NextResponse> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const errors: FieldError[] = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return NextResponse.json(
      { success: false, message: errors[0]?.message || 'Validation failed.', errors },
      { status: 400 }
    );
  }

  return { data: result.data };
}
