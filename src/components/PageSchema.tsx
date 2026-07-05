import type { ReactNode } from 'react';
import SchemaInjector from '@/components/SchemaInjector';

/**
 * Factory for the per-page `(public)` segment layouts. Next.js requires a layout
 * file per route segment to attach that page's admin-managed JSON-LD (via
 * <SchemaInjector page="…" />), so instead of copy-pasting the same wrapper into
 * ~25 files, each layout is now a single line: `export default schemaLayout('/x')`.
 * The injection logic lives here, in one place.
 */
export function schemaLayout(page: string) {
  return function PageSchemaLayout({ children }: { children: ReactNode }) {
    return (
      <>
        <SchemaInjector page={page} />
        {children}
      </>
    );
  };
}
