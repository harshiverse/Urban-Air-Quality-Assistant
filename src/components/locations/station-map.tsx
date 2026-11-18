'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Navigation,
  Radio,
  Sparkles,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MonitoringStationDto } from '@/features/air-quality/types';

export interface StationWithDistance extends MonitoringStationDto {
  distanceKm?: number | null;
  distanceFormatted?: string;
}

interface StationMapProps {
  stations: StationWithDistance[];
  userCoords: { lat: number; lon: number } | null;
  selectedCity?: string;
}

// Bounding box for mainland India geographic projection
const INDIA_BOUNDS = {
  minLat: 8.0,
  maxLat: 34.0,
  minLon: 68.0,
  maxLon: 96.0,
};

export function StationMap({ stations, userCoords, selectedCity }: StationMapProps) {
  const [activeStation, setActiveStation] = React.useState<StationWithDistance | null>(null);

  // Convert lat/lon to percentage within map canvas
  const getCoordinatesPct = (lat: number | null, lon: number | null) => {
    if (lat === null || lon === null) return null;
    const clampedLat = Math.max(INDIA_BOUNDS.minLat, Math.min(INDIA_BOUNDS.maxLat, lat));
    const clampedLon = Math.max(INDIA_BOUNDS.minLon, Math.min(INDIA_BOUNDS.maxLon, lon));

    const x = ((clampedLon - INDIA_BOUNDS.minLon) / (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon)) * 100;
    const y = ((INDIA_BOUNDS.maxLat - clampedLat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * 100;
    return { x, y };
  };

  const userPoint = userCoords ? getCoordinatesPct(userCoords.lat, userCoords.lon) : null;

  return (
    <Card className="relative overflow-hidden border-border/70 bg-gradient-to-b from-card/80 to-card">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span>National CAAQMS Station Geolocation Network</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live geographic distribution of CPCB Continuous Ambient Air Quality Monitoring Stations across India.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
              {stations.length} Active Stations
            </Badge>
            {userCoords && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Navigation className="h-3 w-3 text-primary fill-primary" />
                <span>GPS Calibrated</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[500px] rounded-xl border border-border/60 bg-muted/20 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Subtle Geographic Grid Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="geo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo-grid)" />
            {/* Outline schematic of India's subcontinent boundary */}
            <path
              d="M 28% 18% Q 38% 12% 48% 15% T 65% 26% Q 78% 30% 88% 38% T 72% 52% Q 62% 62% 52% 76% T 45% 92% Q 40% 82% 34% 65% T 22% 46% Q 18% 34% 28% 18% Z"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-40"
            />
          </svg>

          {/* Regional Labels */}
          <div className="absolute top-4 left-6 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60 select-none">
            Northern Plain & Himalayan Foothills
          </div>
          <div className="absolute top-1/2 left-4 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60 select-none">
            Western Coast
          </div>
          <div className="absolute bottom-6 right-6 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60 select-none">
            Bay of Bengal & Southern Peninsula
          </div>

          {/* User Location Marker if available */}
          {userPoint && (
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${userPoint.x}%`, top: `${userPoint.y}%` }}
              title="Your Location"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute h-8 w-8 rounded-full bg-blue-500/30 animate-ping" />
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 shadow-md border-2 border-white">
                  <Navigation className="h-2 w-2 text-white fill-white" />
                </span>
              </div>
            </div>
          )}

          {/* Station Markers */}
          {stations.map((st) => {
            const point = getCoordinatesPct(st.latitude, st.longitude);
            if (!point) return null;

            const isSelected = activeStation?.stationCode === st.stationCode;
            const isCityHighlighted = selectedCity && st.city.toLowerCase() === selectedCity.toLowerCase();

            return (
              <button
                key={st.stationCode}
                type="button"
                onClick={() => setActiveStation(st)}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                aria-label={`Monitoring station ${st.name} in ${st.city}`}
              >
                <div className="relative flex items-center justify-center">
                  {/* Subtle aura on selected/city-highlighted stations */}
                  {(isSelected || isCityHighlighted) && (
                    <span className="absolute h-6 w-6 rounded-full bg-primary/40 animate-pulse" />
                  )}

                  {/* Marker Pin */}
                  <div
                    className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 shadow-sm flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary border-white scale-125 z-30'
                        : isCityHighlighted
                          ? 'bg-primary/90 border-background hover:scale-110'
                          : 'bg-card border-primary/70 hover:bg-primary hover:scale-110'
                    }`}
                  >
                    <span className="h-1 w-1 rounded-full bg-white" />
                  </div>

                  {/* City Label Tag on Hover / Highlight */}
                  {(isSelected || isCityHighlighted) && (
                    <div className="absolute top-4 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-tight bg-background/90 text-foreground border border-border shadow-sm pointer-events-none">
                      {st.city}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Active Station Info Callout Window */}
          {activeStation && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 bg-card/95 backdrop-blur-md p-4 rounded-xl border border-primary/40 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                      {activeStation.stationCode}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">{activeStation.city}</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-tight">
                    {activeStation.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{activeStation.state}, India</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStation(null)}
                  className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                  aria-label="Close station callout"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 text-[11px] font-mono space-y-1 bg-muted/40 p-2.5 rounded-lg border border-border/40">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="text-foreground">
                    {activeStation.latitude?.toFixed(4)}°N, {activeStation.longitude?.toFixed(4)}°E
                  </span>
                </div>
                {activeStation.distanceFormatted && (
                  <div className="flex justify-between text-primary font-semibold">
                    <span>Geodesic Distance:</span>
                    <span>{activeStation.distanceFormatted}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operator:</span>
                  <span className="text-foreground">CPCB / CAAQMS</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button asChild size="sm" className="w-full h-8 text-xs gap-1.5 shadow-sm">
                  <Link
                    href={`/dashboard?city=${encodeURIComponent(activeStation.city)}&station=${encodeURIComponent(
                      activeStation.stationCode
                    )}`}
                  >
                    <span>View Live AQI</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                  <Link
                    href={`/history?city=${encodeURIComponent(activeStation.city)}&station=${encodeURIComponent(
                      activeStation.stationCode
                    )}`}
                  >
                    History
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Map Guidance Footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />
              <span>CPCB CAAQMS Station</span>
            </div>
            {userCoords && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
                <span>Your GPS Fix</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Click any marker to inspect station coordinates and open its live monitor.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
