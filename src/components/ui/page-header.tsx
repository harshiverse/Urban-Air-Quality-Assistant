import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Subtitle / description */
  description?: string;
  /** Right-side action area (e.g. filters, buttons) */
  actions?: React.ReactNode;
  /** Optional breadcrumb or navigation element */
  breadcrumb?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page header used across all dashboard pages.
 * Provides title, optional description, breadcrumbs, and an action slot.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-1">
          {breadcrumb}
        </nav>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
