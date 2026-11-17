'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the dashboard route group.
 * Renders within the AppShell layout (sidebar + header remain functional).
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-20"
      role="alert"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle
          className="h-8 w-8 text-destructive"
          aria-hidden="true"
        />
      </div>
      <div className="text-center space-y-1 max-w-md">
        <h2 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred while loading this page. The navigation
          remains functional — you can try again or visit another section.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
