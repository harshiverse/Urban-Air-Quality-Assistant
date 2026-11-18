'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Compass,
  ExternalLink,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Scale,
  Search,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAqiValue, getAqiCategory } from '@/lib/formatters';
import type { LocationComparisonDto, MonitoringStationDto } from '@/features/air-quality/types';
import { cn } from '@/lib/utils';

export interface StationWithDistance extends MonitoringStationDto {
  distanceKm?: number | null;
  distanceFormatted?: string;
}

export interface LocationsViewProps {
  initialStations: StationWithDistance[];
  initialComparison: LocationComparisonDto;
  featuredCities: Array<{ name: string; state: string; stationCount: number }>;
}

export function LocationsView({
  initialStations,
  initialComparison,
  featuredCities,
}: LocationsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stations, setStations] = React.useState<StationWithDistance[]>(initialStations);
  const [isSearching, setIsSearching] = React.useState(false);

  // Geolocation state
  const [geoStatus, setGeoStatus] = React.useState<
    'idle' | 'locating' | 'granted' | 'denied' | 'error' | 'unsupported'
  >('idle');
  const [userCoords, setUserCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [geoErrorMsg, setGeoErrorMsg] = React.useState<string | null>(null);

  // Multi-city comparison state
  const [selectedComparisonCities, setSelectedComparisonCities] = React.useState<string[]>([
    'Delhi',
    'Mumbai',
    'Bengaluru',
  ]);
  const [comparisonData, setComparisonData] = React.useState<LocationComparisonDto>(initialComparison);
  const [isComparing, setIsComparing] = React.useState(false);

  // Geolocation trigger with explicit browser permission
  const handleFindNearbyStations = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      setGeoErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('locating');
    setGeoErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserCoords({ lat, lon });
        setGeoStatus('granted');

        try {
          setIsSearching(true);
          const res = await fetch(`/api/v1/locations/search?lat=${lat}&lon=${lon}&maxDistanceKm=250`);
          if (res.ok) {
            const json = await res.json();
            const results = json.data?.results ?? (Array.isArray(json) ? json : []);
            setStations(results);
          }
        } catch (err) {
          console.error('Failed to discover nearby stations:', err);
        } finally {
          setIsSearching(false);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
          setGeoErrorMsg(
            'Location permission was declined. You can still search for your city or locality below.'
          );
        } else {
          setGeoStatus('error');
          setGeoErrorMsg('Unable to retrieve location coordinates. Please try searching by city name.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Search input change handler
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);

    // If query cleared and user has coords, reset to nearby stations
    if (!q.trim()) {
      if (userCoords) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `/api/v1/locations/search?lat=${userCoords.lat}&lon=${userCoords.lon}&maxDistanceKm=250`
          );
          if (res.ok) {
            const json = await res.json();
            const results = json.data?.results ?? (Array.isArray(json) ? json : []);
            setStations(results);
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setStations(initialStations);
      }
      return;
    }

    // Debounced search query
    setIsSearching(true);
    try {
      const url = userCoords
        ? `/api/v1/locations/search?q=${encodeURIComponent(q)}&lat=${userCoords.lat}&lon=${userCoords.lon}`
        : `/api/v1/locations/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const results = json.data?.results ?? (Array.isArray(json) ? json : []);
        setStations(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle city in comparison selection
  const handleToggleComparisonCity = async (cityName: string) => {
    let nextCities: string[];
    if (selectedComparisonCities.includes(cityName)) {
      if (selectedComparisonCities.length <= 2) {
        return; // require at least 2 cities
      }
      nextCities = selectedComparisonCities.filter((c) => c !== cityName);
    } else {
      if (selectedComparisonCities.length >= 5) {
        return; // max 5 cities
      }
      nextCities = [...selectedComparisonCities, cityName];
    }

    setSelectedComparisonCities(nextCities);
    setIsComparing(true);
    try {
      const res = await fetch(`/api/v1/air-quality/compare?cities=${encodeURIComponent(nextCities.join(','))}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setComparisonData(json.data);
        }
      }
    } catch (err) {
      console.error('Comparison fetch failed:', err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Geolocation Notice Banner if denied or error */}
      {geoStatus === 'denied' && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <strong>Location access denied:</strong> {geoErrorMsg}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGeoStatus('idle')}
            className="h-7 text-xs text-amber-500 hover:text-amber-400"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="directory" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="directory" className="text-xs gap-1.5">
              <Compass className="h-3.5 w-3.5" />
              Station Directory
            </TabsTrigger>
            <TabsTrigger value="compare" className="text-xs gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Compare Metros
            </TabsTrigger>
          </TabsList>

          {/* Use My Location Trigger */}
          <Button
            variant={geoStatus === 'granted' ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleFindNearbyStations}
            disabled={geoStatus === 'locating'}
            className="gap-2 text-xs border-primary/40 h-9"
          >
            {geoStatus === 'locating' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Locating nearest stations...</span>
              </>
            ) : geoStatus === 'granted' ? (
              <>
                <Navigation className="h-3.5 w-3.5 text-primary fill-primary" />
                <span>Nearby Stations Active</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5 text-primary" />
                <span>Find Stations Near Me</span>
              </>
            )}
          </Button>
        </div>

        {/* Tab 1: Station Directory & Search */}
        <TabsContent value="directory" className="space-y-6">
          {/* Search Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search stations, cities (Delhi, Mumbai, Bengaluru...), or state..."
                  className="pl-10 pr-10 text-sm h-11"
                  aria-label="Search locations and stations"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              {geoStatus === 'granted' && userCoords && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/20">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Sorted by geodesic distance from your device ({userCoords.lat.toFixed(3)}°N,{' '}
                    {userCoords.lon.toFixed(3)}°E)
                  </span>
                  <span className="text-[11px] opacity-80">CPCB CAAQMS Station Grid</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Cities Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Monitored Indian Metros</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/dashboard?city=${encodeURIComponent(city.name)}`}
                  className="group block"
                >
                  <Card className="transition-all hover:border-primary/50 hover:shadow-md bg-card/60 interactive-hover h-full">
                    <CardHeader className="p-3.5 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {city.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {city.stationCount} {city.stationCount === 1 ? 'Station' : 'Stations'}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        {city.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3.5 pt-0">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                        <span>View Live AQI</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Station Results Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Monitoring Stations ({stations.length})</span>
              </h3>
              {searchQuery && (
                <span className="text-xs text-muted-foreground">
                  Filtering for &quot;{searchQuery}&quot;
                </span>
              )}
            </div>

            {stations.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground text-xs">
                No monitoring stations found matching your search. Try searching for a major city name.
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stations.map((st) => (
                  <Card key={st.stationCode} className="flex flex-col justify-between bg-card/50 hover:border-primary/40 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-semibold leading-tight line-clamp-1">
                            {st.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {st.city}, {st.state}
                          </CardDescription>
                        </div>
                        {st.distanceFormatted && (
                          <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary shrink-0">
                            {st.distanceFormatted}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="text-[11px] text-muted-foreground font-mono space-y-0.5 bg-muted/40 p-2 rounded">
                        <div>Code: <strong className="text-foreground">{st.stationCode}</strong></div>
                        {st.latitude !== null && st.longitude !== null && (
                          <div>
                            Coords: {st.latitude.toFixed(4)}°N, {st.longitude.toFixed(4)}°E
                          </div>
                        )}
                        <div>Source: CPCB / CAAQMS</div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={`/dashboard?city=${encodeURIComponent(st.city)}&station=${encodeURIComponent(st.stationCode)}`}
                          className="flex-1"
                        >
                          <Button variant="default" size="sm" className="w-full h-8 text-xs gap-1.5">
                            <span>Open in Dashboard</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Link
                          href={`/history?city=${encodeURIComponent(st.city)}&station=${encodeURIComponent(st.stationCode)}`}
                        >
                          <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                            History
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Multi-City Comparison Workbench */}
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    <span>Multi-City Air Quality Comparison Matrix</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select 2 to 5 Indian cities to benchmark current environmental conditions and health advisories.
                  </CardDescription>
                </div>
                {isComparing && (
                  <Badge variant="outline" className="gap-1.5 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    Updating matrix...
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* City Selection Pills */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Select Metros (Pick 2 to 5):
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredCities.map((city) => {
                    const isSelected = selectedComparisonCities.includes(city.name);
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleToggleComparisonCity(city.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card/70 border-border/70 text-muted-foreground hover:bg-accent/40'
                        )}
                      >
                        <span>{city.name}</span>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cleanest vs Most Polluted Callout Banners */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <Sparkles className="h-4 w-4" />
                    <span>Cleanest Selected Metro</span>
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {comparisonData.lowestAqiCity || 'N/A'}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Station: {comparisonData.cleanestStation || 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    <span>Highest Pollution Exposure</span>
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {comparisonData.highestAqiCity || 'N/A'}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Station: {comparisonData.mostPollutedStation || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              <div className="overflow-x-auto border border-border/60 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                    <tr>
                      <th className="p-3">City</th>
                      <th className="p-3">Monitoring Station</th>
                      <th className="p-3 text-center">Current AQI</th>
                      <th className="p-3 text-center">Category</th>
                      <th className="p-3 text-center">Dominant</th>
                      <th className="p-3 text-center">PM2.5 (µg/m³)</th>
                      <th className="p-3 text-center">PM10 (µg/m³)</th>
                      <th className="p-3">Advisory Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {comparisonData.locations.map((loc) => {
                      const cat = loc.aqi !== null ? getAqiCategory(loc.aqi) : null;
                      return (
                        <tr key={loc.city} className="hover:bg-muted/20">
                          <td className="p-3 font-bold text-foreground">{loc.city}</td>
                          <td className="p-3 text-muted-foreground text-[11px]">
                            {loc.stationName}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-base">
                            {formatAqiValue(loc.aqi)}
                          </td>
                          <td className="p-3 text-center">
                            {cat ? (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-semibold text-white inline-block"
                                style={{ backgroundColor: cat.color }}
                              >
                                {cat.label}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="p-3 text-center uppercase font-medium">
                            {loc.dominantPollutant || 'N/A'}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {loc.pm25 !== null ? loc.pm25 : '—'}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {loc.pm10 !== null ? loc.pm10 : '—'}
                          </td>
                          <td className="p-3 text-muted-foreground text-[11px] max-w-xs truncate">
                            {loc.healthAdvisory}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Attribution and note */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-card/40 p-3 rounded-lg border border-border/40">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span>
                  All AQI and sub-index values are computed per CPCB National Air Quality Index methodology.
                  Measurements are attributed to actual verified monitoring stations.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
