import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { airQualityService } from '@/server/services/air-quality.service';
import type { HistoryTimeRange } from '@/features/air-quality/types';
import { HistoryView } from '@/components/history/history-view';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Historical Air Quality Analysis - CPCB Environmental Intelligence',
  description: 'Explore historical air quality trends, diurnal cycles, pollutant dynamics, and multi-city comparisons.',
};

const SUPPORTED_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Lucknow',
  'Pune',
  'Ahmedabad',
  'Jaipur',
] as const;

interface HistoryPageProps {
  searchParams?: Promise<{
    city?: string;
    station?: string;
    range?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedCity = resolvedParams.city || 'Delhi';
  const selectedRange = (resolvedParams.range as HistoryTimeRange) || '24h';
  const selectedStation = resolvedParams.station;

  // Retrieve primary location historical series
  const historicalData = await airQualityService.getHistoricalAirQuality({
    city: selectedCity,
    stationCode: selectedStation,
    range: selectedRange,
  });

  // Pick 2 comparison cities (different from the selected city)
  const comparisonCities = SUPPORTED_CITIES.filter((c) => c.toLowerCase() !== selectedCity.toLowerCase()).slice(0, 2);

  const comparisonDataPromises = comparisonCities.map((c) =>
    airQualityService.getHistoricalAirQuality({
      city: c,
      range: selectedRange,
    })
  );

  const rawComparisonResults = await Promise.all(comparisonDataPromises);
  const comparisonData = rawComparisonResults.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Analysis & Trends"
        description="Diurnal air pollution progression, NAAQS threshold compliance, and historical environmental trends."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'History' },
            ]}
          />
        }
      />

      {historicalData ? (
        <HistoryView
          initialData={historicalData}
          comparisonData={comparisonData}
          cities={SUPPORTED_CITIES}
          currentCity={selectedCity}
          currentRange={selectedRange}
        />
      ) : (
        <EmptyState
          title="No Historical Data Found"
          description={`Unable to retrieve historical air quality records for ${selectedCity}. Please select another location or try again later.`}
          icon={BarChart3}
        />
      )}
    </div>
  );
}
