'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAqiCategory } from '@/lib/formatters';

interface CityAqiData {
  city: string;
  aqi: number;
  category: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

interface AqiComparisonCardProps {
  currentCity: CityAqiData;
  comparisonCities?: CityAqiData[];
  className?: string;
}

export function AqiComparisonCard({
  currentCity,
  comparisonCities = [],
  className,
}: AqiComparisonCardProps) {
  if (comparisonCities.length === 0) {
    return null;
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    // For AQI, "up" is worse (red), "down" is better (green)
    if (trend === 'up') return 'text-destructive';
    if (trend === 'down') return 'text-green-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>Quick Comparison</span>
          <Link href="/locations">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs hover:underline">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current City (Reference) */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{currentCity.city}</p>
              <p className="text-xs text-muted-foreground">Current Location</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tabular-nums">{currentCity.aqi}</p>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${getAqiCategory(currentCity.aqi).color}20`,
                  borderColor: getAqiCategory(currentCity.aqi).color,
                  color: getAqiCategory(currentCity.aqi).color,
                }}
                className="text-[10px] mt-1"
              >
                {getAqiCategory(currentCity.aqi).label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Comparison Cities */}
        {comparisonCities.map((city) => {
          const TrendIcon = getTrendIcon(city.trend);
          const aqiDiff = city.aqi - currentCity.aqi;
          const isBetter = aqiDiff < 0;

          return (
            <div
              key={city.city}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{city.city}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {city.trend && (
                      <>
                        <TrendIcon className={cn('h-3 w-3', getTrendColor(city.trend))} />
                        {city.changePercent !== undefined && (
                          <span className={cn('text-xs', getTrendColor(city.trend))}>
                            {city.changePercent > 0 ? '+' : ''}
                            {city.changePercent.toFixed(1)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold tabular-nums text-foreground">{city.aqi}</p>
                <p
                  className={cn(
                    'text-xs font-medium',
                    isBetter ? 'text-green-600' : 'text-orange-600'
                  )}
                >
                  {isBetter ? '' : '+'}
                  {aqiDiff}
                </p>
              </div>
            </div>
          );
        })}

        <div className="pt-2">
          <Link href="/locations">
            <Button variant="outline" size="sm" className="w-full">
              Compare More Cities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
