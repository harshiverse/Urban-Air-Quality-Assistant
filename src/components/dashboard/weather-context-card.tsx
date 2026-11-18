import * as React from 'react';
import Link from 'next/link';
import { CloudSun, Wind, Droplets, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WeatherObservationDto } from '@/features/weather/types';

export interface WeatherContextCardProps {
  weather: WeatherObservationDto | null;
  city: string;
}

export function WeatherContextCard({ weather, city }: WeatherContextCardProps) {
  if (!weather) return null;

  return (
    <Card className="interactive-hover">
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

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
          <span>{weather.windSpeed < 5 ? 'Stagnant winds trap pollutants' : 'Active breeze disperses smog'}</span>
          <Link
            href={`/assistant?city=${encodeURIComponent(city)}`}
            className="text-primary hover:underline flex items-center gap-0.5 font-medium"
          >
            <span>Ask AI</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
