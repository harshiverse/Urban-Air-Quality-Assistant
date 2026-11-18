import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Info,
  MapPin,
  Wind,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AqiDisplay } from '@/components/air-quality/aqi-display';
import { AqiScaleBar } from '@/components/air-quality/aqi-scale-bar';
import { DataFreshnessBadge } from '@/components/air-quality/data-freshness-badge';
import { DataSourceAttribution } from '@/components/air-quality/data-source-attribution';
import { MeasurementStatusIndicator } from '@/components/air-quality/measurement-status-indicator';
import { EmptyState } from '@/components/ui/empty-state';
import { CityTabs } from '@/components/dashboard/city-tabs';
import { DashboardViewControls } from '@/components/dashboard/dashboard-view-controls';
import { WeatherContextCard } from '@/components/dashboard/weather-context-card';
import { airQualityService } from '@/server/services/air-quality.service';
import { weatherService } from '@/server/services/weather.service';
import { formatConcentration, getAqiCategoryTextClass } from '@/lib/formatters';

export const metadata: Metadata = {
  title: 'Dashboard - Air Quality Intelligence',
};

interface DashboardProps {
  searchParams?: Promise<{ city?: string; station?: string }>;
}

const SUPPORTED_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Lucknow',
];

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedCity = resolvedParams.city || 'Delhi';
  const selectedStation = resolvedParams.station;

  // Retrieve validated air quality snapshot and meteorological context from domain services
  const snapshot = await airQualityService.getCurrentAirQuality({
    city: selectedCity,
    stationCode: selectedStation,
  });

  const weather = await weatherService.getWeatherForCity(selectedCity);

  const pm25 = snapshot?.pollutants.find((p) => p.pollutant === 'PM2_5');
  const pm10 = snapshot?.pollutants.find((p) => p.pollutant === 'PM10');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${snapshot?.city || selectedCity} Air Quality`}
        description={`Current environmental measurements and official CPCB AQI for ${snapshot?.station.name || selectedCity}.`}
        breadcrumb={<Breadcrumbs items={[{ label: 'Dashboard' }]} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CityTabs cities={SUPPORTED_CITIES} selectedCity={selectedCity} />
          </div>
        }
      />

      {snapshot ? (
        <>
          {/* Main layout grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Primary AQI Card */}
            <Card className="md:row-span-2 flex flex-col justify-between interactive-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      National AQI (CPCB)
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      India
                    </Badge>
                  </div>
                  <MeasurementStatusIndicator status={snapshot.measurementStatus} />
                </div>
                <CardDescription className="flex items-center gap-1.5 pt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>{snapshot.station.name}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* AQI display */}
                <AqiDisplay
                  value={snapshot.aqi}
                  category={snapshot.category}
                  size="lg"
                />

                {/* AQI Scale bar with exact marker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>CPCB Scale (0–500)</span>
                    <span className="font-medium text-foreground">
                      Index: {snapshot.aqi ?? 'N/A'}
                    </span>
                  </div>
                  <AqiScaleBar currentValue={snapshot.aqi ?? undefined} />
                </div>

                {/* Provenance and Freshness info */}
                <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Freshness:</span>
                    <DataFreshnessBadge observedAt={snapshot.measurementTimestamp} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sufficiency:</span>
                    <span className="font-medium text-foreground">
                      {snapshot.sufficiency.totalValidPollutants} pollutants active
                    </span>
                  </div>
                  <DataSourceAttribution
                    source={snapshot.station.provider}
                    stationName={snapshot.station.name}
                    stationId={snapshot.station.stationCode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dominant Pollutant */}
            <Card className="interactive-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dominant Pollutant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {snapshot.dominantPollutant?.replace('_', '.') || '—'}
                  </span>
                  {snapshot.category && (
                    <span className={`text-xs font-semibold ${getAqiCategoryTextClass(snapshot.category)}`}>
                      Sub-index: {snapshot.aqi ?? '—'}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {snapshot.dominantPollutantName || 'Highest sub-index determines overall AQI'}
                </p>
              </CardContent>
            </Card>

            {/* PM2.5 Level */}
            <Card className="interactive-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    PM2.5 Level
                  </CardTitle>
                  {pm25?.category && (
                    <Badge variant={pm25.category === 'GOOD' ? 'good' : 'destructive'} className="text-[10px]">
                      {pm25.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {pm25 ? formatConcentration(pm25.concentration, pm25.unit) : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fine respirable particles (24-hour average)
                </p>
              </CardContent>
            </Card>

            {/* PM10 Level */}
            <Card className="interactive-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    PM10 Level
                  </CardTitle>
                  {pm10?.category && (
                    <Badge variant={pm10.category === 'GOOD' ? 'good' : 'secondary'} className="text-[10px]">
                      {pm10.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {pm10 ? formatConcentration(pm10.concentration, pm10.unit) : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coarse inhalable particles (24-hour average)
                </p>
              </CardContent>
            </Card>

            {/* Monitoring Station Metadata */}
            <Card className="interactive-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monitoring Station
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold text-foreground">
                  {snapshot.station.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  State: {snapshot.station.state} • Code: {snapshot.station.stationCode}
                </p>
              </CardContent>
            </Card>

            {/* Weather & Atmospheric Context */}
            <WeatherContextCard weather={weather} city={selectedCity} />
          </div>

          {/* Interactive View Controls (WHO Toggle, Audience Advice Tabs, Pollutant Grid) */}
          <DashboardViewControls
            pollutants={snapshot.pollutants}
            healthAdvisory={snapshot.healthAdvisory}
            categoryLabel={snapshot.categoryLabel}
            aqi={snapshot.aqi}
          />
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title={`No air quality data for ${selectedCity}`}
              description="Unable to find active monitoring stations for this location. Please select another city from the navigation."
              icon={Wind}
            />
          </CardContent>
        </Card>
      )}

      {/* Methodology Callout */}
      <Card className="bg-muted/40">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Calculated using the official National Air Quality Index methodology (CPCB). Dominant pollutant represents the highest individual sub-index.
            </span>
          </div>
          <Link
            href="/methodology"
            className="shrink-0 font-medium text-primary hover:underline"
          >
            Read Methodology →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
