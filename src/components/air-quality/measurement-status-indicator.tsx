import * as React from 'react';
import {
  Radio,
  Database,
  Clock,
  TrendingUp,
  HelpCircle,
  WifiOff,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type MeasurementStatus =
  | 'live'
  | 'cached'
  | 'historical'
  | 'forecast'
  | 'estimated'
  | 'unavailable';

export interface MeasurementStatusIndicatorProps {
  /** Current measurement data status */
  status: MeasurementStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  MeasurementStatus,
  {
    label: string;
    icon: React.ElementType;
    colorClass: string;
    description: string;
  }
> = {
  live: {
    label: 'Live',
    icon: Radio,
    colorClass: 'text-green-600 dark:text-green-400',
    description: 'Real-time observation data',
  },
  cached: {
    label: 'Cached',
    icon: Database,
    colorClass: 'text-blue-600 dark:text-blue-400',
    description: 'Locally cached data',
  },
  historical: {
    label: 'Historical',
    icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    description: 'Historical observation data',
  },
  forecast: {
    label: 'Forecast',
    icon: TrendingUp,
    colorClass: 'text-purple-600 dark:text-purple-400',
    description: 'Forecasted/predicted data',
  },
  estimated: {
    label: 'Estimated',
    icon: HelpCircle,
    colorClass: 'text-orange-600 dark:text-orange-400',
    description: 'Estimated/interpolated data',
  },
  unavailable: {
    label: 'Unavailable',
    icon: WifiOff,
    colorClass: 'text-muted-foreground',
    description: 'Data currently unavailable',
  },
};

/**
 * Indicator showing measurement data status with distinct icons, text labels, and colors.
 * Never relies on color alone (WCAG compliance).
 */
const MeasurementStatusIndicator = React.forwardRef<
  HTMLSpanElement,
  MeasurementStatusIndicatorProps
>(({ status, className }, ref) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      className={cn('inline-flex items-center gap-1.5', config.colorClass, className)}
      role="status"
      aria-label={`Data status: ${config.label} — ${config.description}`}
      title={config.description}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="text-xs font-medium">{config.label}</span>
    </span>
  );
});
MeasurementStatusIndicator.displayName = 'MeasurementStatusIndicator';

export { MeasurementStatusIndicator };
