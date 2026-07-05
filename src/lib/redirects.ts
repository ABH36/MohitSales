import prisma from '@/lib/prisma';

/**
 * Detects whether adding a redirect `from → to` would create a redirect loop,
 * by walking the active redirect chain starting at `to` (capped at 10 hops).
 * Returns true if the chain leads back to `from` (or cycles). `excludeId` skips
 * the redirect currently being edited so it doesn't match itself.
 *
 * Shared by POST /api/admin/seo/redirects and PUT /api/admin/seo/redirects/[id].
 */
export async function wouldCreateLoop(from: string, to: string, excludeId?: string): Promise<boolean> {
  const visited = new Set<string>([from]);
  let current = to;
  for (let i = 0; i < 10; i++) {
    if (visited.has(current)) return true;
    visited.add(current);
    const next = await prisma.redirect.findFirst({
      where: { fromPath: current, isActive: true, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { toPath: true },
    });
    if (!next) break;
    current = next.toPath;
  }
  return false;
}
