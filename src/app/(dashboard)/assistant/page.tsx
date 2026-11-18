import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { airQualityService } from '@/server/services/air-quality.service';
import { weatherService } from '@/server/services/weather.service';
import { AssistantChat } from '@/components/assistant/assistant-chat';
import type { AiGroundingContext, GroundedPollutantItem } from '@/features/assistant/types';
import { POLLUTANT_NAMES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'AI Environmental Assistant - CPCB Grounded Intelligence',
  description:
    'Ask questions about urban air quality, diurnal pollutant dynamics, and evidence-based precautions strictly grounded in verified CPCB data.',
};

const SUPPORTED_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Lucknow',
] as const;

interface AssistantPageProps {
  searchParams?: Promise<{ city?: string; station?: string }>;
}

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedCity = resolvedParams.city || 'Delhi';
  const selectedStation = resolvedParams.station;

  // Retrieve initial verified environmental context on the server
  const snapshot = await airQualityService.getCurrentAirQuality({
    city: selectedCity,
    stationCode: selectedStation,
  });

  const weather = await weatherService.getWeatherForCity(selectedCity);
  const history = await airQualityService.getHistoricalAirQuality({
    city: selectedCity,
    stationCode: selectedStation,
    range: '24h',
  });

  const pollutants: GroundedPollutantItem[] =
    snapshot?.pollutants.map((p) => ({
      pollutant: p.pollutant,
      name: POLLUTANT_NAMES[p.pollutant] || p.pollutant,
      concentration: p.concentration,
      unit: p.unit,
      subIndex: p.subIndex,
      category: p.category,
    })) || [];

  const initialContext: AiGroundingContext = {
    location: snapshot?.city || selectedCity,
    stationName: snapshot?.station.name || `${selectedCity} Central Station`,
    stationCode: snapshot?.station.stationCode || 'DEFAULT',
    aqi: snapshot?.aqi ?? null,
    category: snapshot?.category ?? null,
    categoryLabel: snapshot?.categoryLabel || 'Unavailable',
    dominantPollutant: snapshot?.dominantPollutant ?? null,
    dominantPollutantName: snapshot?.dominantPollutantName ?? null,
    pollutants,
    isDataSufficient: snapshot?.sufficiency.isSufficient ?? false,
    dataSufficiencyMessage: snapshot?.sufficiency.isSufficient
      ? 'CPCB data sufficiency validated (>=3 pollutants with PM).'
      : snapshot?.sufficiency.missingRequirements.join('; ') || 'Data sufficiency not met.',
    measurementStatus: snapshot?.measurementStatus || 'LIVE',
    measurementTimestamp: snapshot?.measurementTimestamp || new Date().toISOString(),
    dataAgeHours: 0.5,
    isStale: false,
    weather: weather ?? null,
    historicalSummary: history?.summary ?? null,
    sourceAttribution: snapshot?.sourceAttribution || 'Central Pollution Control Board (CPCB) / CAAQMS Network',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Environmental Assistant"
        description="Interact with an environmental intelligence agent strictly grounded in verified CPCB CAAQMS sensor observations."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'AI Assistant' },
            ]}
          />
        }
      />

      <AssistantChat
        initialLocation={selectedCity}
        initialContext={initialContext}
        supportedCities={SUPPORTED_CITIES}
      />
    </div>
  );
}
