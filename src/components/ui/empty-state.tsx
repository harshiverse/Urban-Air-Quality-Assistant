import * as React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Custom icon (defaults to Inbox) */
  icon?: LucideIcon;
  /** Action element (e.g. a button to add first item) */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state placeholder for when no data is available.
 * Distinct from error states — this represents valid but empty results.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted p-3">
        <Icon
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
