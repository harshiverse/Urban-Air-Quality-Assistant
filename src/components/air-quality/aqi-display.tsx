import * as React from 'react';

import { cn } from '@/lib/utils';
import { formatAqiValue, getAqiCategory, getAqiCategoryTextClass } from '@/lib/formatters';

export interface AqiDisplayProps {
  /** Numeric AQI value, or null if unavailable */
  value: number | null;
  /** AQI category key (e.g. 'GOOD', 'SEVERE'), or null */
  category: string | null;
  /** Display size */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: { number: 'text-3xl', label: 'text-sm' },
  md: { number: 'text-5xl', label: 'text-base' },
  lg: { number: 'text-7xl', label: 'text-lg' },
} as const;

/**
 * Large AQI number display with category label.
 * Uses semantic color coding + text label (never color alone per WCAG).
 */
const AqiDisplay = React.forwardRef<HTMLDivElement, AqiDisplayProps>(
  ({ value, category, size = 'md', className }, ref) => {
    const isUnavailable = value === null;

    // Derive display values
    const displayValue = formatAqiValue(value);
    const resolved = value !== null ? getAqiCategory(value) : null;
    const categoryLabel = resolved?.label ?? category ?? 'Unknown';
    const colorClass = category
      ? getAqiCategoryTextClass(category)
      : 'text-muted-foreground';

    const { number: numberSize, label: labelSize } = sizeClasses[size];

    const ariaLabel = isUnavailable
      ? 'Air Quality Index: unavailable'
      : `Air Quality Index: ${displayValue}, ${categoryLabel}`;

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center gap-1', className)}
        role="status"
        aria-label={ariaLabel}
      >
        <span
          className={cn(
            'font-bold leading-none tabular-nums',
            numberSize,
            isUnavailable ? 'text-muted-foreground' : colorClass
          )}
        >
          {displayValue}
        </span>
        <span
          className={cn(
            'font-medium',
            labelSize,
            isUnavailable ? 'text-muted-foreground' : colorClass
          )}
        >
          {categoryLabel}
        </span>
      </div>
    );
  }
);
AqiDisplay.displayName = 'AqiDisplay';

export { AqiDisplay };
