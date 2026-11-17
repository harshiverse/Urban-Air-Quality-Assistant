import { Wind } from 'lucide-react';

/**
 * Root-level loading state shown during initial page load.
 * Uses the application's brand icon for visual continuity.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status">
      <div className="flex flex-col items-center gap-4">
        <Wind
          className="h-12 w-12 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">Loading…</p>
        <span className="sr-only">Loading application</span>
      </div>
    </div>
  );
}
