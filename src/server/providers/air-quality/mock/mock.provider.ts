import type {
  AirQualityObservation,
  MonitoringStationDto,
} from '@/features/air-quality/types';
import type { IAirQualityProvider, ProviderMetadata } from '../provider.interface';

export const MOCK_STATIONS: MonitoringStationDto[] = [
  {
    id: 'station-dl-001',
    stationCode: 'DL001',
    name: 'Anand Vihar, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6468,
    longitude: 77.316,
    provider: 'CPCB',
    isActive: true,
  },
  {
    id: 'station-dl-002',
    stationCode: 'DL002',
    name: 'ITO, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6289,
    longitude: 77.241,
    provider: 'CPCB',
    isActive: true,
  },
  {
    id: 'station-mh-001',
    stationCode: 'MH001',
    name: 'Bandra, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0596,
    longitude: 72.8295,
    provider: 'MPCB',
    isActive: true,
  },
  {
    id: 'station-ka-001',
    stationCode: 'KA001',
    name: 'BTM Layout, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9166,
    longitude: 77.6101,
    provider: 'KSPCB',
    isActive: true,
  },
  {
    id: 'station-wb-001',
    stationCode: 'WB001',
    name: 'Victoria Memorial, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    latitude: 22.5448,
    longitude: 88.3426,
    provider: 'WBPCB',
    isActive: true,
  },
  {
    id: 'station-tn-001',
    stationCode: 'TN001',
    name: 'Alandur, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 12.9975,
    longitude: 80.201,
    provider: 'TNPCB',
    isActive: true,
  },
  {
    id: 'station-ts-001',
    stationCode: 'TS001',
    name: 'Sanathnagar, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4563,
    longitude: 78.4439,
    provider: 'TSPCB',
    isActive: true,
  },
  {
    id: 'station-up-001',
    stationCode: 'UP001',
    name: 'Lalbagh, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    latitude: 26.8467,
    longitude: 80.9462,
    provider: 'UPPCB',
    isActive: true,
  },
];

/**
 * Deterministic mock observations for each station
 * Reflects authentic meteorological and pollution patterns in Indian cities
 */
function generateObservationsForStation(stationCode: string): AirQualityObservation[] {
  const now = new Date();
  // 15 minutes ago
  const observedAt = new Date(now.getTime() - 15 * 60 * 1000);

  // Different realistic profiles based on city
  if (stationCode.startsWith('DL')) {
    // Delhi: Poor/Very Poor typical winter-transition levels
    return [
      {
        stationId: stationCode,
        pollutantType: 'PM2_5',
        concentration: 142.5,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'PM10',
        concentration: 268.0,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'NO2',
        concentration: 68.4,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'SO2',
        concentration: 18.2,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'CO',
        concentration: 1.85,
        unit: 'mg/m³',
        averagingPeriod: '8h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'O3',
        concentration: 42.0,
        unit: 'µg/m³',
        averagingPeriod: '8h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'NH3',
        concentration: 32.5,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
    ];
  }

  if (stationCode === 'KA001') {
    // Bengaluru: Satisfactory profile
    return [
      {
        stationId: stationCode,
        pollutantType: 'PM2_5',
        concentration: 34.0,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'PM10',
        concentration: 62.0,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'NO2',
        concentration: 24.5,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: stationCode,
        pollutantType: 'CO',
        concentration: 0.65,
        unit: 'mg/m³',
        averagingPeriod: '8h',
        observedAt,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
    ];
  }

  // Default moderate profile for other cities
  return [
    {
      stationId: stationCode,
      pollutantType: 'PM2_5',
      concentration: 68.0,
      unit: 'µg/m³',
      averagingPeriod: '24h',
      observedAt,
      dataQualityFlag: 'VALID',
      sourceProvider: 'CPCB',
    },
    {
      stationId: stationCode,
      pollutantType: 'PM10',
      concentration: 135.0,
      unit: 'µg/m³',
      averagingPeriod: '24h',
      observedAt,
      dataQualityFlag: 'VALID',
      sourceProvider: 'CPCB',
    },
    {
      stationId: stationCode,
      pollutantType: 'NO2',
      concentration: 38.0,
      unit: 'µg/m³',
      averagingPeriod: '24h',
      observedAt,
      dataQualityFlag: 'VALID',
      sourceProvider: 'CPCB',
    },
    {
      stationId: stationCode,
      pollutantType: 'SO2',
      concentration: 12.0,
      unit: 'µg/m³',
      averagingPeriod: '24h',
      observedAt,
      dataQualityFlag: 'VALID',
      sourceProvider: 'CPCB',
    },
    {
      stationId: stationCode,
      pollutantType: 'CO',
      concentration: 0.95,
      unit: 'mg/m³',
      averagingPeriod: '8h',
      observedAt,
      dataQualityFlag: 'VALID',
      sourceProvider: 'CPCB',
    },
  ];
}

export class MockAirQualityProvider implements IAirQualityProvider {
  public readonly id = 'MOCK_CPCB';

  public getMetadata(): ProviderMetadata {
    return {
      name: 'Development Mock CPCB Provider',
      sourceAttribution: 'Central Pollution Control Board (Simulated Reference Data)',
      updateFrequency: '15 minutes',
      isAvailable: true,
      rateLimitPerMinute: 1000,
    };
  }

  public async getStations(city?: string): Promise<MonitoringStationDto[]> {
    if (!city) return MOCK_STATIONS;
    return MOCK_STATIONS.filter(
      (s) => s.city.toLowerCase() === city.toLowerCase()
    );
  }

  public async getObservationsByStation(
    stationCode: string
  ): Promise<AirQualityObservation[]> {
    const station = MOCK_STATIONS.find(
      (s) => s.stationCode.toLowerCase() === stationCode.toLowerCase()
    );
    if (!station) {
      return [];
    }
    return generateObservationsForStation(station.stationCode);
  }

  public async getObservationsByCity(
    city: string
  ): Promise<{ station: MonitoringStationDto; observations: AirQualityObservation[] } | null> {
    const stations = await this.getStations(city);
    if (stations.length === 0) {
      return null;
    }
    // Return primary station for the city
    const primaryStation = stations[0];
    if (!primaryStation) {
      return null;
    }
    const observations = generateObservationsForStation(primaryStation.stationCode);
    return { station: primaryStation, observations };
  }
}
