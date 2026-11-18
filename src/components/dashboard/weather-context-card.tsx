'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CloudSun,
  Wind,
  Droplets,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WeatherObservationDto } from '@/features/weather/types';

export interface WeatherContextCardProps {
  weather: WeatherObservationDto | null;
  city: string;
}

export function WeatherContextCard({ weather, city }: WeatherContextCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!weather) return null;

  return (
    <Card className="interactive-hover transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <CloudSun className="h-4 w-4 text-primary" />
            <span>Atmospheric Meteorology</span>
          </CardTitle>
          <Badge
            variant={weather.inversionRisk === 'HIGH' ? 'destructive' : 'outline'}
            className="text-[10px]"
          >
            Inversion: {weather.inversionRisk}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {weather.condition} • Dispersion: {weather.dispersionPotential}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {weather.temperature}°C
            </span>
            <span className="text-xs text-muted-foreground">
              (Feels {weather.feelsLike}°C)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-primary" />
              {weather.windSpeed} km/h {weather.windDirection}
            </span>
          </div>
        </div>

        {/* Dynamic Contextual One-Liner */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <span>
            {weather.inversionRisk === 'HIGH'
              ? 'Cool ground & light winds trapping particulate smog.'
              : weather.windSpeed < 5
                ? 'Stagnant winds allow local particulate buildup.'
                : 'Active airflow assisting regional pollutant dilution.'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-[10px] px-1.5 text-primary hover:text-primary/80 gap-0.5"
          >
            <span>{isExpanded ? 'Less' : 'Analysis'}</span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {/* Detailed Scientific Correlation Drawer */}
        {isExpanded && (
          <div className="space-y-2.5 pt-2 border-t border-border/40 text-xs animate-in fade-in slide-in-from-top-1">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span>Thermal Inversion & Boundary Layer Trap</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {weather.inversionRisk === 'HIGH'
                  ? 'High risk of a nocturnal surface inversion: Radiational ground cooling traps cooler, denser air beneath a warm upper layer, sealing particulates within the lowest 100 meters of the urban breathing zone.'
                  : weather.inversionRisk === 'MODERATE'
                    ? 'Moderate atmospheric stability: Vertical convective mixing is partially restricted by morning thermal stratification.'
                    : 'Unstable, well-mixed atmosphere: Solar convective thermal plumes assist natural upward dispersal of emissions.'}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                <Wind className="h-3.5 w-3.5 text-primary" />
                <span>Ventilation & Dispersion Potential</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Wind speed of {weather.windSpeed} km/h from {weather.windDirection} yields a{' '}
                <strong className="text-foreground">{weather.dispersionPotential.toLowerCase()}</strong>{' '}
                ventilation coefficient. Horizontal wind transport and boundary layer height together dictate how fast
                particulate plumes clear urban corridors.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                <Droplets className="h-3.5 w-3.5 text-blue-400" />
                <span>Hygroscopic Growth & Aerosol Chemistry</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {weather.humidity > 70
                  ? `Relative humidity (${weather.humidity}%) triggers hygroscopic swelling of sulfate/nitrate particulates, intensifying optical haze and light extinction.`
                  : `Relative humidity (${weather.humidity}%) remains balanced, minimizing moisture-induced secondary aerosol growth.`}
              </p>
            </div>

            {/* Scientific Evidence Guardrail */}
            <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground bg-primary/5 p-2 rounded border border-primary/20">
              <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Scientific Principle</strong>: Weather dictates pollutant dilution and accumulation rates, but
                does not generate chemical emissions. Ground emissions remain the primary driver.
              </span>
            </div>
          </div>
        )}

        {/* Footer Link to AI Assistant */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>AI Atmospheric Correlation</span>
          </span>
          <Link
            href={`/assistant?city=${encodeURIComponent(city)}&query=${encodeURIComponent(
              `How does the current weather affect air pollution in ${city}?`
            )}`}
            className="text-primary hover:underline flex items-center gap-0.5 font-medium"
          >
            <span>Ask Assistant</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
