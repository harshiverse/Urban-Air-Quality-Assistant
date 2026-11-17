import type {
  AirQualityObservation,
  MonitoringStationDto,
  PollutantType,
} from '@/features/air-quality/types';
import type { IAirQualityProvider, ProviderMetadata } from '../provider.interface';
import { env } from '@/lib/env';

const OPENAQ_BASE_URL = 'https://api.openaq.org/v3';

const OPENAQ_POLLUTANT_MAP: Record<string, PollutantType> = {
  pm25: 'PM2_5',
  pm10: 'PM10',
  no2: 'NO2',
  so2: 'SO2',
  co: 'CO',
  o3: 'O3',
  nh3: 'NH3',
  pb: 'PB',
};

interface OpenAQLatestResult {
  sensorsId?: number;
  value?: number;
  parameter?: {
    name?: string;
    units?: string;
  };
  datetime?: {
    utc?: string;
  };
}

export class OpenAQProvider implements IAirQualityProvider {
  public readonly id = 'OPENAQ';
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.OPENAQ_API_KEY;
  }

  public getMetadata(): ProviderMetadata {
    return {
      name: 'OpenAQ Platform v3',
      sourceAttribution: 'OpenAQ Community & Government Air Sensors',
      updateFrequency: 'Hourly to Real-Time',
      isAvailable: Boolean(this.apiKey),
      rateLimitPerMinute: 60,
    };
  }

  public async getStations(_city?: string): Promise<MonitoringStationDto[]> {
    // OpenAQ station listing for India (country ID / coordinates)
    return [];
  }

  public async getObservationsByStation(
    _stationCode: string
  ): Promise<AirQualityObservation[]> {
    return [];
  }

  public async getObservationsByCity(
    city: string
  ): Promise<{ station: MonitoringStationDto; observations: AirQualityObservation[] } | null> {
    if (!this.apiKey) return null;

    try {
      const url = new URL(`${OPENAQ_BASE_URL}/locations`);
      url.searchParams.set('countries_id', 'IN');
      url.searchParams.set('name', city);
      url.searchParams.set('limit', '1');

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) return null;

      const data = await res.json();
      const location = data.results?.[0];
      if (!location) return null;

      const station: MonitoringStationDto = {
        id: `openaq-${location.id}`,
        stationCode: `OPENAQ_${location.id}`,
        name: location.name || `${city} Station`,
        city: city,
        state: 'India',
        latitude: location.coordinates?.latitude || null,
        longitude: location.coordinates?.longitude || null,
        provider: 'OpenAQ',
        isActive: true,
      };

      // Fetch latest measurements
      const latestUrl = `${OPENAQ_BASE_URL}/locations/${location.id}/latest`;
      const latestRes = await fetch(latestUrl, { headers });
      if (!latestRes.ok) return { station, observations: [] };

      const latestData = await latestRes.json();
      const results: OpenAQLatestResult[] = latestData.results || [];

      const observations: AirQualityObservation[] = [];
      for (const item of results) {
        const paramName = item.parameter?.name?.toLowerCase();
        if (!paramName) continue;
        const mapped = OPENAQ_POLLUTANT_MAP[paramName];
        if (!mapped || item.value === undefined || item.value === null) continue;

        const date = item.datetime?.utc ? new Date(item.datetime.utc) : new Date();

        observations.push({
          stationId: station.stationCode,
          pollutantType: mapped,
          concentration: item.value,
          unit: item.parameter?.units || (mapped === 'CO' ? 'mg/m³' : 'µg/m³'),
          averagingPeriod: mapped === 'CO' || mapped === 'O3' ? '8h' : '24h',
          observedAt: date,
          dataQualityFlag: 'VALID',
          sourceProvider: 'OpenAQ',
        });
      }

      return { station, observations };
    } catch {
      return null;
    }
  }
}
