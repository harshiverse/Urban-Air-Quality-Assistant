import * as React from 'react';

import { cn } from '@/lib/utils';
import { AQI_CATEGORIES } from '@/lib/constants';

export interface AqiScaleBarProps {
  /** If provided, renders a marker at this AQI value on the scale */
  currentValue?: number;
  className?: string;
}

/** Ordered list of segments for the 0-500 AQI scale */
const SEGMENTS = [
  { key: 'GOOD', ...AQI_CATEGORIES.GOOD, bgClass: 'bg-aqi-good', fgClass: 'text-aqi-good-foreground' },
  { key: 'SATISFACTORY', ...AQI_CATEGORIES.SATISFACTORY, bgClass: 'bg-aqi-satisfactory', fgClass: 'text-aqi-satisfactory-foreground' },
  { key: 'MODERATELY_POLLUTED', ...AQI_CATEGORIES.MODERATELY_POLLUTED, bgClass: 'bg-aqi-moderate', fgClass: 'text-aqi-moderate-foreground' },
  { key: 'POOR', ...AQI_CATEGORIES.POOR, bgClass: 'bg-aqi-poor', fgClass: 'text-aqi-poor-foreground' },
  { key: 'VERY_POOR', ...AQI_CATEGORIES.VERY_POOR, bgClass: 'bg-aqi-veryPoor', fgClass: 'text-aqi-veryPoor-foreground' },
  { key: 'SEVERE', ...AQI_CATEGORIES.SEVERE, bgClass: 'bg-aqi-severe', fgClass: 'text-aqi-severe-foreground' },
] as const;

const TOTAL_RANGE = 500;

/**
 * Horizontal AQI scale bar showing all 6 CPCB categories.
 * Optionally displays a marker at the current AQI value.
 */
const AqiScaleBar = React.forwardRef<HTMLDivElement, AqiScaleBarProps>(
  ({ currentValue, className }, ref) => {
    // Clamp marker position to 0-500
    const clampedValue =
      currentValue !== undefined
        ? Math.max(0, Math.min(TOTAL_RANGE, currentValue))
        : undefined;
    const markerPercent =
      clampedValue !== undefined ? (clampedValue / TOTAL_RANGE) * 100 : undefined;

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        role="img"
        aria-label={
          currentValue !== undefined
            ? `AQI scale from 0 to 500. Current value: ${Math.round(currentValue)}`
            : 'AQI scale from 0 to 500'
        }
      >
        {/* Scale bar */}
        <div className="relative flex h-6 w-full overflow-hidden rounded-md">
          {SEGMENTS.map((seg) => {
            const width = ((seg.max - seg.min + 1) / (TOTAL_RANGE + 1)) * 100;
            return (
              <div
                key={seg.key}
                className={cn(
                  'flex items-center justify-center overflow-hidden text-[10px] font-medium leading-none',
                  seg.bgClass,
                  seg.fgClass
                )}
                style={{ width: `${width}%` }}
              >
                <span className="hidden truncate px-0.5 sm:inline">
                  {seg.label}
                </span>
              </div>
            );
          })}

          {/* Marker */}
          {markerPercent !== undefined && (
            <div
              className="absolute top-0 h-full w-0.5 bg-foreground"
              style={{ left: `${markerPercent}%` }}
              aria-hidden="true"
            >
              <div className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground" />
            </div>
          )}
        </div>

        {/* Labels below the bar */}
        <div className="mt-1 flex w-full text-[10px] text-muted-foreground">
          {SEGMENTS.map((seg) => {
            const width = ((seg.max - seg.min + 1) / (TOTAL_RANGE + 1)) * 100;
            return (
              <div
                key={`label-${seg.key}`}
                className="truncate text-center"
                style={{ width: `${width}%` }}
              >
                {seg.min}–{seg.max}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
AqiScaleBar.displayName = 'AqiScaleBar';

export { AqiScaleBar };
