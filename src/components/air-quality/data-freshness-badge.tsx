'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { formatRelativeTime, getDataFreshness } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';

export interface DataFreshnessBadgeProps {
  /** When the observation was recorded */
  observedAt: Date | string | null;
  /** When the data was retrieved from the provider */
  retrievalTimestamp?: Date | string;
  className?: string;
}

const FRESHNESS_CONFIG = {
  live: {
    label: 'Live',
    variant: 'default' as const,
    dotColor: 'bg-green-500',
  },
  recent: {
    label: 'Recent',
    variant: 'secondary' as const,
    dotColor: 'bg-yellow-500',
  },
  stale: {
    label: 'Stale',
    variant: 'outline' as const,
    dotColor: 'bg-orange-500',
  },
  outdated: {
    label: 'Outdated',
    variant: 'destructive' as const,
    dotColor: 'bg-red-500',
  },
  unknown: {
    label: 'Unknown',
    variant: 'outline' as const,
    dotColor: 'bg-gray-400',
  },
} as const;

/**
 * Badge showing data freshness status based on observation timestamp.
 * Displays freshness label + relative time text.
 */
const DataFreshnessBadge = React.forwardRef<HTMLDivElement, DataFreshnessBadgeProps>(
  ({ observedAt, className }, ref) => {
    const freshness = getDataFreshness(observedAt);
    const config = FRESHNESS_CONFIG[freshness];
    const relativeTime = formatRelativeTime(observedAt);

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        className={cn('gap-1.5', className)}
        aria-label={`Data freshness: ${config.label}, ${relativeTime}`}
      >
        <span
          className={cn('inline-block h-2 w-2 rounded-full', config.dotColor)}
          aria-hidden="true"
        />
        <span>{config.label}</span>
        {freshness !== 'unknown' && (
          <span className="font-normal opacity-75">· {relativeTime}</span>
        )}
      </Badge>
    );
  }
);
DataFreshnessBadge.displayName = 'DataFreshnessBadge';

export { DataFreshnessBadge };
