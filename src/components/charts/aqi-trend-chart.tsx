'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { getAqiCategory, formatAqiValue } from '@/lib/formatters';
import type { HistoricalDataPoint } from '@/features/air-quality/types';
import { AlertCircle } from 'lucide-react';

export interface AqiTrendChartProps {
  data: HistoricalDataPoint[];
  height?: number;
  showBands?: boolean;
  className?: string;
}

const CPCB_BANDS = [
  { y1: 0, y2: 50, color: '#10b981', label: 'Good' },
  { y1: 50, y2: 100, color: '#84cc16', label: 'Satisfactory' },
  { y1: 100, y2: 200, color: '#eab308', label: 'Moderate' },
  { y1: 200, y2: 300, color: '#f97316', label: 'Poor' },
  { y1: 300, y2: 400, color: '#ef4444', label: 'Very Poor' },
  { y1: 400, y2: 500, color: '#991b1b', label: 'Severe' },
];

interface TooltipPayloadItem {
  value: number | null;
  payload: HistoricalDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomAqiTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];
  if (!item) return null;
  const point = item.payload;
  const aqi = point.aqi;
  const isMissing = point.isMissing || aqi === null;

  const category = aqi !== null ? getAqiCategory(aqi) : null;

  return (
    <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[180px]">
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <span className="font-medium text-muted-foreground">{point.label}</span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isMissing ? (
        <div className="flex items-center gap-1.5 text-amber-500 py-1 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Sensor data gap / Calibration</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-medium">AQI</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-foreground font-mono">
                {formatAqiValue(aqi)}
              </span>
              {category && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.label}
                </span>
              )}
            </div>
          </div>

          {point.dominantPollutant && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Dominant:</span>
              <span className="font-semibold text-foreground uppercase">{point.dominantPollutant}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function AqiTrendChart({
  data,
  height = 320,
  showBands = true,
  className,
}: AqiTrendChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={cn('w-full rounded-xl bg-card/40 border border-border/40 animate-pulse flex items-center justify-center text-xs text-muted-foreground', className)}
      >
        Initializing trend chart...
      </div>
    );
  }

  // Calculate dynamic max domain for Y-axis (clamped at least 250, capped comfortably)
  const maxAqi = data.reduce<number>((max, p) => (p.aqi !== null && p.aqi > max ? p.aqi : max), 100);
  const yDomainMax = Math.min(500, Math.max(250, Math.ceil(maxAqi / 50) * 50 + 20));

  return (
    <div className={cn('w-full flex flex-col', className)}>
      <div style={{ width: '100%', height }} className="relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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
              domain={[0, yDomainMax]}
              stroke="hsl(var(--muted-foreground) / 0.6)"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickCount={6}
            />

            {showBands &&
              CPCB_BANDS.map((band, idx) => (
                <ReferenceArea
                  key={idx}
                  y1={band.y1}
                  y2={Math.min(band.y2, yDomainMax)}
                  fill={band.color}
                  fillOpacity={0.04}
                  stroke={band.color}
                  strokeOpacity={0.12}
                  strokeDasharray="2 4"
                />
              ))}

            <Tooltip content={<CustomAqiTooltip />} />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aqiAreaGradient)"
              connectNulls={false}
              dot={{ r: 2.5, fill: '#3b82f6', stroke: '#1d4ed8', strokeWidth: 1 }}
              activeDot={{ r: 6, fill: '#60a5fa', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {showBands && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
          {CPCB_BANDS.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: b.color }} />
              <span>
                {b.label} ({b.y1}-{b.y2})
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-muted-foreground/80 pl-2">
            <span className="inline-block w-4 h-0.5 border-b border-dashed border-muted-foreground/60" />
            <span>Gap = Sensor Maintenance</span>
          </div>
        </div>
      )}
    </div>
  );
}
