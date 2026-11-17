import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  formatAqiValue,
  getAqiCategoryColorClass,
  getAqiCategoryTextClass,
} from '@/lib/formatters';
import { AQI_CATEGORIES } from '@/lib/constants';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface PollutantCardProps {
  /** Pollutant display name (e.g. "PM2.5") */
  name: string;
  /** Measured concentration, or null if unavailable */
  concentration: number | null;
  /** Concentration unit (e.g. "µg/m³") */
  unit: string;
  /** Computed sub-index value, or null */
  subIndex: number | null;
  /** AQI category key for the sub-index (e.g. 'GOOD'), or null */
  category: string | null;
  /** Time-averaging period (e.g. "24-hour", "8-hour") */
  averagingPeriod?: string;
  className?: string;
}

/**
 * Card displaying a single pollutant measurement with its sub-index.
 * Always shows text labels alongside color (WCAG compliance).
 */
const PollutantCard = React.forwardRef<HTMLDivElement, PollutantCardProps>(
  (
    {
      name,
      concentration,
      unit,
      subIndex,
      category,
      averagingPeriod,
      className,
    },
    ref
  ) => {
    const categoryInfo = category
      ? (AQI_CATEGORIES[category as keyof typeof AQI_CATEGORIES] ?? null)
      : null;
    const categoryLabel = categoryInfo?.label ?? 'Unknown';

    const ariaLabel = [
      name,
      concentration !== null
        ? `concentration ${concentration} ${unit}`
        : 'concentration unavailable',
      subIndex !== null
        ? `sub-index ${Math.round(subIndex)}, ${categoryLabel}`
        : 'sub-index unavailable',
      averagingPeriod ? `${averagingPeriod} average` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40',
          className
        )}
        aria-label={ariaLabel}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{name}</CardTitle>
          {averagingPeriod && (
            <p className="text-xs text-muted-foreground">
              {averagingPeriod} avg
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Concentration */}
          <div>
            <span className="text-2xl font-bold tabular-nums">
              {concentration !== null ? concentration : '—'}
            </span>
            {concentration !== null && (
              <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
            )}
            {concentration === null && (
              <span className="ml-1 text-sm text-muted-foreground">N/A</span>
            )}
          </div>

          {/* Sub-index */}
          <div className="flex items-center gap-2">
            {subIndex !== null && category ? (
              <>
                <span
                  className={cn(
                    'inline-block h-3 w-3 rounded-full',
                    getAqiCategoryColorClass(category)
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    getAqiCategoryTextClass(category)
                  )}
                >
                  {formatAqiValue(subIndex)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {categoryLabel}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Sub-index: N/A
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
PollutantCard.displayName = 'PollutantCard';

export { PollutantCard };
