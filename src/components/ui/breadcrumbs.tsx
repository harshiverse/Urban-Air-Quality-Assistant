import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** URL to link to; omit for the current (last) item */
  href?: string;
}

export interface BreadcrumbsProps {
  /** Ordered list of breadcrumb items (last = current page) */
  items: BreadcrumbItem[];
  /** Whether to show a Home icon for the first item */
  showHomeIcon?: boolean;
  className?: string;
}

/**
 * Breadcrumb navigation component following WAI-ARIA breadcrumb pattern.
 * The last item is rendered as the current page (not a link).
 */
export function Breadcrumbs({
  items,
  showHomeIcon = true,
  className,
}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('', className)}>
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? '/'}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  {isFirst && showHomeIcon && (
                    <Home className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
