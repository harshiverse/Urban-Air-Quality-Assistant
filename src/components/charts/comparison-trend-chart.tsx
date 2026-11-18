'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { HistoricalDataPoint } from '@/features/air-quality/types';
import { formatAqiValue, getAqiCategory } from '@/lib/formatters';

export interface ComparisonSeries {
  location: string;
  stationName?: string;
  color: string;
  dataPoints: HistoricalDataPoint[];
}

export interface ComparisonTrendChartProps {
  series: ComparisonSeries[];
  height?: number;
  className?: string;
}

const DEFAULT_SERIES_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | null;
    color: string;
  }>;
  label?: string;
}

function CustomComparisonTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
      <div className="font-medium text-muted-foreground border-b border-border/60 pb-1">
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const val = item.value;
          const cat = val !== null ? getAqiCategory(val) : null;

          return (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-foreground">
                  {formatAqiValue(val)}
                </span>
                {cat && (
                  <span
                    className="px-1 py-0.2 rounded text-[9px] font-medium text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ComparisonTrendChart({
  series,
  height = 340,
  className,
}: ComparisonTrendChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Merge the series data points into aligned points for Recharts LineChart
  const mergedData = React.useMemo(() => {
    if (!series || series.length === 0) return [];

    // Find the series with the most data points as the primary timeline
    const baseSeries = series[0];
    if (!baseSeries) return [];

    return baseSeries.dataPoints.map((basePoint, idx) => {
      const entry: Record<string, string | number | null> = {
        label: basePoint.label,
        timestamp: basePoint.timestamp,
      };

      series.forEach((s) => {
        // Try finding matching point by timestamp or index
        const match = s.dataPoints[idx] ?? s.dataPoints.find((p) => p.timestamp === basePoint.timestamp);
        entry[s.location] = match?.aqi ?? null;
      });

      return entry;
    });
  }, [series]);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={cn('w-full rounded-xl bg-card/40 border border-border/40 animate-pulse flex items-center justify-center text-xs text-muted-foreground', className)}
      >
        Initializing comparison matrix...
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div
        style={{ height }}
        className={cn('w-full rounded-xl bg-card/20 border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground', className)}
      >
        Select locations to generate comparative trend line.
      </div>
    );
  }

  return (
    <div className={cn('w-full flex flex-col', className)}>
      <div style={{ width: '100%', height }} className="relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />

            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground) / 0.6)"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border) / 0.4)' }}
              interval="preserveStartEnd"
              minTickGap={28}
            />

            <YAxis
              domain={[0, (dataMax: number) => Math.min(500, Math.max(200, Math.ceil(dataMax / 50) * 50 + 20))]}
              stroke="hsl(var(--muted-foreground) / 0.6)"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomComparisonTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
            />

            {series.map((s, idx) => {
              const color = s.color || DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length];
              return (
                <Line
                  key={s.location}
                  type="monotone"
                  dataKey={s.location}
                  name={s.location}
                  stroke={color}
                  strokeWidth={2.2}
                  dot={{ r: 2, fill: color }}
                  activeDot={{ r: 5, fill: color, stroke: '#ffffff', strokeWidth: 1.5 }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
        <span>* Simultaneous timeline comparison using CPCB sub-index calculations</span>
        <span>Sensor maintenance gaps preserved</span>
      </div>
    </div>
  );
}
