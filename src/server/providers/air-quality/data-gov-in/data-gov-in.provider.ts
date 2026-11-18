import type {
  AirQualityObservation,
  HistoricalAirQualityDto,
  HistoryTimeRange,
  MonitoringStationDto,
  PollutantType,
} from '@/features/air-quality/types';
import type { IAirQualityProvider, ProviderMetadata } from '../provider.interface';
import { env } from '@/lib/env';

/**
 * data.gov.in Real-Time Air Quality Index CPCB Resource ID
 */
const DATA_GOV_RESOURCE_ID = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource';

interface DataGovInRecord {
  id?: string;
  country?: string;
  state?: string;
  city?: string;
  station?: string;
  last_update?: string;
  pollutant_id?: string;
  pollutant_min?: string;
  pollutant_max?: string;
  pollutant_avg?: string;
  pollutant_unit?: string;
}

const POLLUTANT_MAP: Record<string, PollutantType> = {
  'PM2.5': 'PM2_5',
  PM25: 'PM2_5',
  PM10: 'PM10',
  NO2: 'NO2',
  SO2: 'SO2',
  CO: 'CO',
  OZONE: 'O3',
  O3: 'O3',
  NH3: 'NH3',
  PB: 'PB',
  LEAD: 'PB',
};

export class DataGovInProvider implements IAirQualityProvider {
  public readonly id = 'DATA_GOV_IN';
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.DATA_GOV_IN_API_KEY;
  }

  public getMetadata(): ProviderMetadata {
    return {
      name: 'CPCB via data.gov.in (National Data Sharing and Accessibility Policy)',
      sourceAttribution: 'Central Pollution Control Board (CPCB) via Open Government Data Platform India',
      updateFrequency: 'Hourly',
      isAvailable: Boolean(this.apiKey),
      rateLimitPerMinute: 60,
    };
  }

  public async getStations(city?: string): Promise<MonitoringStationDto[]> {
    if (!this.apiKey) return [];

    try {
      const url = new URL(`${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}`);
      url.searchParams.set('api-key', this.apiKey);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '500');
      if (city) {
        url.searchParams.set('filters[city]', city);
      }

      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        return [];
      }

      const json = await res.json();
      const records: DataGovInRecord[] = json.records || [];

      const stationMap = new Map<string, MonitoringStationDto>();

      for (const rec of records) {
        if (!rec.station || !rec.city || !rec.state) continue;
        const code = `${rec.city.substring(0, 3).toUpperCase()}_${rec.station.replace(/[^a-zA-Z0-9]/g, '_')}`;

        if (!stationMap.has(code)) {
          stationMap.set(code, {
            id: `station-${code.toLowerCase()}`,
            stationCode: code,
            name: rec.station,
            city: rec.city,
            state: rec.state,
            latitude: null,
            longitude: null,
            provider: 'CPCB via data.gov.in',
            isActive: true,
          });
        }
      }

      return Array.from(stationMap.values());
    } catch {
      return [];
    }
  }

  public async getObservationsByStation(
    _stationCode: string
  ): Promise<AirQualityObservation[]> {
    if (!this.apiKey) return [];

    try {
      const url = new URL(`${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}`);
      url.searchParams.set('api-key', this.apiKey);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '50');

      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) return [];

      const json = await res.json();
      const records: DataGovInRecord[] = json.records || [];

      return this.transformRecords(records);
    } catch {
      return [];
    }
  }

  public async getObservationsByCity(
    city: string
  ): Promise<{ station: MonitoringStationDto; observations: AirQualityObservation[] } | null> {
    if (!this.apiKey) return null;

    try {
      const url = new URL(`${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}`);
      url.searchParams.set('api-key', this.apiKey);
      url.searchParams.set('format', 'json');
      url.searchParams.set('filters[city]', city);
      url.searchParams.set('limit', '50');

      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) return null;

      const json = await res.json();
      const records: DataGovInRecord[] = json.records || [];

      if (records.length === 0) return null;

      const firstRecord = records[0];
      if (!firstRecord) return null;
      const stationName = firstRecord.station || `${city} Central`;
      const stationCode = `${city.substring(0, 3).toUpperCase()}_001`;

      const station: MonitoringStationDto = {
        id: `station-${stationCode.toLowerCase()}`,
        stationCode,
        name: stationName,
        city: firstRecord.city || city,
        state: firstRecord.state || city,
        latitude: null,
        longitude: null,
        provider: 'CPCB via data.gov.in',
        isActive: true,
      };

      const observations = this.transformRecords(records);
      return { station, observations };
    } catch {
      return null;
    }
  }

  private transformRecords(records: DataGovInRecord[]): AirQualityObservation[] {
    const observations: AirQualityObservation[] = [];

    for (const rec of records) {
      if (!rec.pollutant_id || !rec.pollutant_avg) continue;

      const mappedType = POLLUTANT_MAP[rec.pollutant_id.toUpperCase()];
      if (!mappedType) continue;

      const concentration = parseFloat(rec.pollutant_avg);
      if (Number.isNaN(concentration) || concentration < 0) continue;

      const observedAt = rec.last_update ? new Date(rec.last_update) : new Date();

      observations.push({
        stationId: rec.station || 'unknown',
        pollutantType: mappedType,
        concentration,
        unit: rec.pollutant_unit || (mappedType === 'CO' ? 'mg/m³' : 'µg/m³'),
        averagingPeriod: mappedType === 'CO' || mappedType === 'O3' ? '8h' : '24h',
        observedAt: Number.isNaN(observedAt.getTime()) ? new Date() : observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB via data.gov.in',
      });
    }

    return observations;
  }

  public async getHistoricalData(_params: {
    stationCode?: string;
    city?: string;
    range: HistoryTimeRange;
  }): Promise<HistoricalAirQualityDto | null> {
    // The data.gov.in real-time endpoint only publishes instantaneous 15-minute observations.
    // Return null to signal the service layer to fall back to persisted database observations or reference dataset.
    return null;
  }
}
