'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PollutantCard } from '@/components/air-quality/pollutant-card';
import { ShieldAlert, Users, Baby, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PollutantSubIndex } from '@/features/air-quality/types';

interface DashboardViewControlsProps {
  pollutants: PollutantSubIndex[];
  healthAdvisory: string;
  categoryLabel: string;
  aqi: number | null;
}

type AudienceGroup = 'general' | 'vulnerable' | 'active';

export function DashboardViewControls({
  pollutants,
  healthAdvisory,
  categoryLabel,
  aqi,
}: DashboardViewControlsProps) {
  // Toggle states
  const [showWhoStandard, setShowWhoStandard] = React.useState(false);
  const [selectedAudience, setSelectedAudience] = React.useState<AudienceGroup>('general');
  const [liveAutoRefresh, setLiveAutoRefresh] = React.useState(false);

  // WHO 2021 Reference limits: PM2.5 = 15 µg/m³, PM10 = 45 µg/m³, NO2 = 25 µg/m³
  const pm25 = pollutants.find((p) => p.pollutant === 'PM2_5');
  const pm10 = pollutants.find((p) => p.pollutant === 'PM10');

  const pm25WhoMultiplier =
    pm25 && pm25.concentration ? (pm25.concentration / 15).toFixed(1) : null;
  const pm10WhoMultiplier =
    pm10 && pm10.concentration ? (pm10.concentration / 45).toFixed(1) : null;

  // Audience-specific health guidance
  const audienceGuidance: Record<AudienceGroup, { title: string; advice: string; icon: typeof Users }> = {
    general: {
      title: 'General Citizen Advisory',
      advice: healthAdvisory,
      icon: Users,
    },
    vulnerable: {
      title: 'Children, Elderly & Sensitive Individuals',
      advice:
        (aqi ?? 0) > 200
          ? 'Remain indoors as much as possible. Keep windows closed during peak morning and evening traffic. Keep prescribed inhalers and medications handy. Use HEPA-certified indoor air purifiers.'
          : (aqi ?? 0) > 100
            ? 'Limit prolonged outdoor exertion. Sensitive individuals should wear an N95 mask if spending more than 30 minutes outside near busy roads.'
            : 'Air quality is suitable for normal outdoor activities. Keep routine medications accessible.',
      icon: Baby,
    },
    active: {
      title: 'Outdoor Workers, Runners & Cyclists',
      advice:
        (aqi ?? 0) > 200
          ? 'Avoid high-intensity outdoor cardio training. Shift exercise indoors or workout in ventilated gym spaces. Outdoor laborers should wear particulate-filtering N95 respirators with exhalation valves.'
          : (aqi ?? 0) > 100
            ? 'Reschedule strenuous outdoor cardio to early afternoons when particulate dispersion is typically higher, avoiding stagnant early morning inversions.'
            : 'Safe for regular outdoor jogging, running, cycling, and construction work.',
      icon: Bike,
    },
  };

  const currentAudience = audienceGuidance[selectedAudience];
  const AudienceIcon = currentAudience.icon;

  return (
    <div className="space-y-6">
      {/* Interactive Controls Bar: Toggles and Switches */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-3.5 backdrop-blur shadow-sm transition-all duration-200">
        <div className="flex flex-wrap items-center gap-6">
          {/* WHO vs CPCB Standards Switch */}
          <div className="flex items-center gap-2.5">
            <Switch
              id="who-standard"
              checked={showWhoStandard}
              onCheckedChange={setShowWhoStandard}
              aria-label="Toggle WHO 2021 Reference Limits"
            />
            <Label
              htmlFor="who-standard"
              className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-1.5"
            >
              <span>Compare with WHO 2021 Limits</span>
              {showWhoStandard && (
                <Badge variant="outline" className="text-[10px] py-0 px-1 bg-primary/10 text-primary border-primary/30">
                  Active
                </Badge>
              )}
            </Label>
          </div>

          {/* Auto Refresh Live Switch */}
          <div className="flex items-center gap-2.5">
            <Switch
              id="live-refresh"
              checked={liveAutoRefresh}
              onCheckedChange={setLiveAutoRefresh}
              aria-label="Toggle Live Auto-Refresh"
            />
            <Label
              htmlFor="live-refresh"
              className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-1.5"
            >
              <span>Live Updates</span>
              {liveAutoRefresh && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </Label>
          </div>
        </div>

        {/* Informative Benchmark Pill */}
        {showWhoStandard && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in zoom-in-95 duration-200">
            {pm25WhoMultiplier && (
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                PM2.5: {pm25WhoMultiplier}× WHO limit
              </span>
            )}
            {pm10WhoMultiplier && (
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                PM10: {pm10WhoMultiplier}× WHO limit
              </span>
            )}
          </div>
        )}
      </div>

      {/* Interactive Health Guidance Card with Smooth Audience Segmented Tabs */}
      <Card className="border-l-4 border-l-primary transition-all duration-300 shadow-sm hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <div>
                <CardTitle className="text-base font-semibold">
                  Health Guidance & Precautions
                </CardTitle>
                <CardDescription className="text-xs">
                  Category: {categoryLabel} • Official CPCB Advisory
                </CardDescription>
              </div>
            </div>

            {/* Smooth Segmented Pill Tabs for Audience */}
            <div
              role="tablist"
              aria-label="Audience target for health advisory"
              className="inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground self-start sm:self-auto border border-border/50"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedAudience === 'general'}
                onClick={() => setSelectedAudience('general')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-out active:scale-95',
                  selectedAudience === 'general'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'hover:text-foreground hover:bg-background/40'
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>All Citizens</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedAudience === 'vulnerable'}
                onClick={() => setSelectedAudience('vulnerable')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-out active:scale-95',
                  selectedAudience === 'vulnerable'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'hover:text-foreground hover:bg-background/40'
                )}
              >
                <Baby className="h-3.5 w-3.5" />
                <span>Sensitive</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedAudience === 'active'}
                onClick={() => setSelectedAudience('active')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-out active:scale-95',
                  selectedAudience === 'active'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'hover:text-foreground hover:bg-background/40'
                )}
              >
                <Bike className="h-3.5 w-3.5" />
                <span>Outdoor / Active</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3.5 border border-border/40 transition-all duration-200">
            <AudienceIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                {currentAudience.title}
              </h4>
              <p className="text-sm text-foreground leading-relaxed transition-opacity duration-200">
                {currentAudience.advice}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pollutant Breakdown Grid with Smooth Hover Effects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>Pollutant Breakdown</span>
              {showWhoStandard && (
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                  Compared with WHO 2021 Reference
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Individual concentrations and corresponding official CPCB sub-indices.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {pollutants.length} Pollutants Monitored
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {pollutants.map((p) => {
            const isPm25 = p.pollutant === 'PM2_5';
            const isPm10 = p.pollutant === 'PM10';
            const whoMultiplier = isPm25
              ? pm25WhoMultiplier
              : isPm10
                ? pm10WhoMultiplier
                : null;

            return (
              <div key={p.pollutant} className="relative group">
                <PollutantCard
                  name={p.pollutant.replace('_', '.')}
                  concentration={p.concentration}
                  unit={p.unit}
                  subIndex={p.subIndex}
                  category={p.category}
                  averagingPeriod={p.averagingPeriod}
                  className="h-full transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-primary/40"
                />
                {showWhoStandard && whoMultiplier && (
                  <div className="absolute top-2 right-2 animate-in fade-in zoom-in-95 duration-200">
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 shadow-sm">
                      {whoMultiplier}× WHO
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
