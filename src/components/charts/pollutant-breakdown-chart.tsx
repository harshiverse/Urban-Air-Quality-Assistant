'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { HistoricalDataPoint, PollutantType } from '@/features/air-quality/types';
import { Button } from '@/components/ui/button';

export interface PollutantBreakdownChartProps {
  data: HistoricalDataPoint[];
  height?: number;
  className?: string;
}

interface PollutantConfig {
  key: keyof HistoricalDataPoint;
  pollutantType: PollutantType;
  label: string;
  unit: string;
  color: string;
  naaqsLimit: number | null; // CPCB National Ambient Air Quality Standard
}

const POLLUTANTS: PollutantConfig[] = [
  { key: 'pm25', pollutantType: 'PM2_5', label: 'PM2.5', unit: 'µg/m³', color: '#f97316', naaqsLimit: 60 },
  { key: 'pm10', pollutantType: 'PM10', label: 'PM10', unit: 'µg/m³', color: '#eab308', naaqsLimit: 100 },
  { key: 'no2', pollutantType: 'NO2', label: 'NO₂', unit: 'µg/m³', color: '#ec4899', naaqsLimit: 80 },
  { key: 'so2', pollutantType: 'SO2', label: 'SO₂', unit: 'µg/m³', color: '#8b5cf6', naaqsLimit: 80 },
  { key: 'co', pollutantType: 'CO', label: 'CO', unit: 'mg/m³', color: '#06b6d4', naaqsLimit: 2 },
  { key: 'o3', pollutantType: 'O3', label: 'O₃', unit: 'µg/m³', color: '#10b981', naaqsLimit: 100 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | null;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomPollutantTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
      <div className="font-medium text-muted-foreground border-b border-border/60 pb-1">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((item) => {
          const config = POLLUTANTS.find((p) => p.key === item.dataKey);
          if (!config) return null;

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-foreground">{config.label}</span>
              </div>
              <span className="font-mono text-foreground font-semibold">
                {item.value !== null ? `${item.value} ${config.unit}` : 'Missing'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PollutantBreakdownChart({
  data,
  height = 320,
  className,
}: PollutantBreakdownChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [activePollutants, setActivePollutants] = React.useState<Set<string>>(
    new Set(['pm25', 'pm10'])
  );
  const [showNaaqs, setShowNaaqs] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const togglePollutant = (key: string) => {
    setActivePollutants((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) {
          next.delete(key);
        }
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={cn('w-full rounded-xl bg-card/40 border border-border/40 animate-pulse flex items-center justify-center text-xs text-muted-foreground', className)}
      >
        Initializing pollutant curves...
      </div>
    );
  }

  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      {/* Pollutant Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground mr-1 font-medium">Pollutants:</span>
          {POLLUTANTS.map((p) => {
            const isActive = activePollutants.has(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => togglePollutant(p.key)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border',
                  isActive
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-border/60 text-muted-foreground hover:bg-accent/40 bg-card/60'
                )}
                style={isActive ? { backgroundColor: p.color } : undefined}
              >
                <span>{p.label}</span>
                <span className="text-[10px] opacity-80">({p.unit})</span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNaaqs((prev) => !prev)}
          className={cn('h-7 text-xs border-dashed', showNaaqs && 'bg-accent/40 border-primary/40')}
        >
          {showNaaqs ? 'Hide NAAQS Limits' : 'Show NAAQS Limits'}
        </Button>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height }} className="relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
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
              stroke="hsl(var(--muted-foreground) / 0.6)"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomPollutantTooltip />} />

            {/* Render NAAQS standard threshold reference lines for active pollutants */}
            {showNaaqs &&
              POLLUTANTS.filter((p) => activePollutants.has(p.key) && p.naaqsLimit !== null).map((p) => (
                <ReferenceLine
                  key={`naaqs-${p.key}`}
                  y={p.naaqsLimit!}
                  stroke={p.color}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  strokeOpacity={0.7}
                  label={{
                    value: `NAAQS ${p.label}: ${p.naaqsLimit}`,
                    position: 'insideTopRight',
                    fill: p.color,
                    fontSize: 10,
                  }}
                />
              ))}

            {/* Render active pollutant lines */}
            {POLLUTANTS.filter((p) => activePollutants.has(p.key)).map((p) => (
              <Line
                key={p.key}
                type="monotone"
                dataKey={p.key}
                name={p.label}
                stroke={p.color}
                strokeWidth={2}
                dot={{ r: 2, fill: p.color }}
                activeDot={{ r: 5, fill: p.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <span>* Dashed lines indicate CPCB National Ambient Air Quality Standards (NAAQS) safe limits.</span>
        <span>Sensor gaps shown as breaks.</span>
      </div>
    </div>
  );
}
