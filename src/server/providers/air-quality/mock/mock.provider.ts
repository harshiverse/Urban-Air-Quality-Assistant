import type {
  AirQualityObservation,
  AqiCategoryKey,
  HistoricalAirQualityDto,
  HistoricalDataPoint,
  HistoryTimeRange,
  HistoricalSummary,
  MonitoringStationDto,
  PollutantType,
} from '@/features/air-quality/types';
import type { IAirQualityProvider, ProviderMetadata } from '../provider.interface';
import { calculateSubIndex } from '@/features/air-quality/domain/aqi-calculator';
import { POLLUTANT_NAMES } from '@/lib/constants';

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

  public async getHistoricalData(params: {
    stationCode?: string;
    city?: string;
    range: HistoryTimeRange;
  }): Promise<HistoricalAirQualityDto | null> {
    let station: MonitoringStationDto | undefined;

    if (params.stationCode) {
      station = MOCK_STATIONS.find(
        (s) => s.stationCode.toLowerCase() === params.stationCode!.toLowerCase()
      );
      if (!station) return null;
    } else if (params.city) {
      station = MOCK_STATIONS.find(
        (s) => s.city.toLowerCase() === params.city!.toLowerCase()
      );
      if (!station) return null;
    } else {
      station = MOCK_STATIONS[0]!; // Default to Anand Vihar, Delhi
    }

    return generateHistoricalDataForStation(station, params.range);
  }
}

/**
 * City baseline profiles reflecting authentic meteorology and emission patterns
 */
const CITY_PROFILES: Record<string, {
  basePm25: number;
  basePm10: number;
  baseNo2: number;
  baseSo2: number;
  baseCo: number;
  baseO3: number;
  baseNh3: number;
}> = {
  DELHI: { basePm25: 142.5, basePm10: 268.0, baseNo2: 68.4, baseSo2: 18.2, baseCo: 1.85, baseO3: 42.0, baseNh3: 32.5 },
  LUCKNOW: { basePm25: 118.0, basePm10: 224.0, baseNo2: 56.0, baseSo2: 15.0, baseCo: 1.6, baseO3: 38.0, baseNh3: 28.0 },
  KOLKATA: { basePm25: 88.0, basePm10: 168.0, baseNo2: 48.0, baseSo2: 14.0, baseCo: 1.25, baseO3: 44.0, baseNh3: 24.0 },
  MUMBAI: { basePm25: 58.0, basePm10: 122.0, baseNo2: 42.0, baseSo2: 16.0, baseCo: 1.1, baseO3: 48.0, baseNh3: 20.0 },
  HYDERABAD: { basePm25: 48.0, basePm10: 94.0, baseNo2: 36.0, baseSo2: 12.0, baseCo: 0.95, baseO3: 50.0, baseNh3: 18.0 },
  CHENNAI: { basePm25: 38.0, basePm10: 76.0, baseNo2: 32.0, baseSo2: 10.0, baseCo: 0.85, baseO3: 46.0, baseNh3: 16.0 },
  BENGALURU: { basePm25: 26.0, basePm10: 52.0, baseNo2: 28.0, baseSo2: 8.0, baseCo: 0.75, baseO3: 52.0, baseNh3: 14.0 },
};

function generateHistoricalDataForStation(
  station: MonitoringStationDto,
  range: HistoryTimeRange
): HistoricalAirQualityDto {
  const profileKey = station.city.toUpperCase();
  const profile = CITY_PROFILES[profileKey] || CITY_PROFILES.DELHI!;

  const now = new Date();
  const dataPoints: HistoricalDataPoint[] = [];

  let count = 24;
  let stepMs = 60 * 60 * 1000; // 1 hour
  let labelFormat: 'hour' | 'day' = 'hour';

  if (range === '24h') {
    count = 24;
    stepMs = 60 * 60 * 1000;
    labelFormat = 'hour';
  } else if (range === '7d') {
    count = 7;
    stepMs = 24 * 60 * 60 * 1000;
    labelFormat = 'day';
  } else if (range === '30d') {
    count = 30;
    stepMs = 24 * 60 * 60 * 1000;
    labelFormat = 'day';
  } else if (range === '90d') {
    count = 90;
    stepMs = 24 * 60 * 60 * 1000;
    labelFormat = 'day';
  }

  for (let i = 0; i < count; i++) {
    const pointTime = new Date(now.getTime() - (count - 1 - i) * stepMs);

    let label = '';
    if (labelFormat === 'hour') {
      const h = pointTime.getHours().toString().padStart(2, '0');
      label = `${h}:00`;
    } else {
      const day = pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      label = day;
    }

    // Deliberate missing data point to test missing-data handling (e.g. at index 3 for 24h, or index 5 for 30d)
    const isMissingPoint = (range === '24h' && i === 3) || (range === '30d' && i === 12);

    if (isMissingPoint) {
      dataPoints.push({
        timestamp: pointTime.toISOString(),
        label,
        aqi: null,
        category: null,
        dominantPollutant: null,
        pm25: null,
        pm10: null,
        no2: null,
        so2: null,
        co: null,
        o3: null,
        nh3: null,
        isMissing: true,
      });
      continue;
    }

    // Authentic meteorological diurnal variation
    let multiplier = 1.0;
    if (labelFormat === 'hour') {
      const h = pointTime.getHours();
      if (h >= 8 && h <= 10) multiplier = 1.25; // Morning rush hour
      else if (h >= 12 && h <= 16) multiplier = 0.8; // Afternoon dispersion
      else if (h >= 19 && h <= 22) multiplier = 1.35; // Evening peak
      else if (h >= 0 && h <= 5) multiplier = 1.15; // Night boundary layer inversion
    } else {
      // Seasonal & weekly drift
      const dayOfWeek = pointTime.getDay();
      const weekendDip = dayOfWeek === 0 || dayOfWeek === 6 ? 0.88 : 1.02;
      const seasonalWave = 1 + Math.sin(i / 5) * 0.12;
      multiplier = weekendDip * seasonalWave;
    }

    // Compute concentrations with slight realistic deterministic variations
    const round2 = (val: number) => Math.round(val * 10) / 10;
    const pm25 = round2(profile.basePm25 * multiplier);
    const pm10 = round2(profile.basePm10 * multiplier);
    const no2 = round2(profile.baseNo2 * (multiplier * 0.9 + 0.1));
    const so2 = round2(profile.baseSo2 * (multiplier * 0.8 + 0.2));
    const co = round2(profile.baseCo * multiplier);
    const o3 = round2(profile.baseO3 * (2 - multiplier)); // O3 peaks when UV is high and primary traffic is lower
    const nh3 = round2(profile.baseNh3 * multiplier);

    // Compute sub-indices per CPCB
    const subPm25 = calculateSubIndex('PM2_5', pm25);
    const subPm10 = calculateSubIndex('PM10', pm10);
    const subNo2 = calculateSubIndex('NO2', no2);
    const subSo2 = calculateSubIndex('SO2', so2);
    const subCo = calculateSubIndex('CO', co, 'mg/m³');
    const subO3 = calculateSubIndex('O3', o3);
    const subNh3 = calculateSubIndex('NH3', nh3);

    const candidates: Array<{ pollutant: PollutantType; subIndex: number; category: AqiCategoryKey }> = [];
    if (subPm25) candidates.push({ pollutant: 'PM2_5', subIndex: subPm25.subIndex, category: subPm25.category });
    if (subPm10) candidates.push({ pollutant: 'PM10', subIndex: subPm10.subIndex, category: subPm10.category });
    if (subNo2) candidates.push({ pollutant: 'NO2', subIndex: subNo2.subIndex, category: subNo2.category });
    if (subSo2) candidates.push({ pollutant: 'SO2', subIndex: subSo2.subIndex, category: subSo2.category });
    if (subCo) candidates.push({ pollutant: 'CO', subIndex: subCo.subIndex, category: subCo.category });
    if (subO3) candidates.push({ pollutant: 'O3', subIndex: subO3.subIndex, category: subO3.category });
    if (subNh3) candidates.push({ pollutant: 'NH3', subIndex: subNh3.subIndex, category: subNh3.category });

    candidates.sort((a, b) => b.subIndex - a.subIndex);
    const top = candidates[0];

    dataPoints.push({
      timestamp: pointTime.toISOString(),
      label,
      aqi: top ? top.subIndex : null,
      category: top ? top.category : null,
      dominantPollutant: top ? top.pollutant : null,
      pm25,
      pm10,
      no2,
      so2,
      co,
      o3,
      nh3,
      isMissing: false,
    });
  }

  // Summary calculation
  const validPoints = dataPoints.filter((p) => !p.isMissing && p.aqi !== null);
  const aqiValues = validPoints.map((p) => p.aqi as number);
  const minAqi = aqiValues.length > 0 ? Math.min(...aqiValues) : null;
  const maxAqi = aqiValues.length > 0 ? Math.max(...aqiValues) : null;
  const avgAqi = aqiValues.length > 0 ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) : null;

  // Dominant pollutant frequency
  const dominantCounts: Record<string, number> = {};
  for (const p of validPoints) {
    if (p.dominantPollutant) {
      dominantCounts[p.dominantPollutant] = (dominantCounts[p.dominantPollutant] || 0) + 1;
    }
  }
  let dominantPollutant: PollutantType | null = 'PM2_5';
  let maxCount = 0;
  for (const [pol, cnt] of Object.entries(dominantCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      dominantPollutant = pol as PollutantType;
    }
  }

  const dominantName = dominantPollutant ? POLLUTANT_NAMES[dominantPollutant] : null;
  const completenessPercentage =
    dataPoints.length > 0
      ? Math.round((validPoints.length / dataPoints.length) * 1000) / 10
      : 100;

  const summary: HistoricalSummary = {
    minAqi,
    maxAqi,
    avgAqi,
    dominantPollutant,
    dominantPollutantName: dominantName,
    completenessPercentage,
    totalPoints: dataPoints.length,
    validPoints: validPoints.length,
  };

  return {
    location: station.city,
    station,
    range,
    dataPoints,
    summary,
    retrievedAt: new Date().toISOString(),
    sourceAttribution: `${station.provider} • Historic observations for ${station.name}`,
  };
}
