import type {
  AirQualityObservation,
  AirQualitySnapshotDto,
  DataFreshness,
  HistoricalAirQualityDto,
  HistoryTimeRange,
  LocationComparisonDto,
  LocationComparisonItemDto,
  MeasurementStatus,
  MonitoringStationDto,
  NearbyStationDto,
} from '@/features/air-quality/types';
import { calculateCpcbAqi } from '@/features/air-quality/domain/aqi-calculator';
import { CPCB_HEALTH_ADVISORIES } from '@/features/air-quality/domain/breakpoints';
import { getAirQualityProvider } from '../providers/air-quality/provider.factory';
import { MockAirQualityProvider } from '../providers/air-quality/mock/mock.provider';
import { globalCache } from '../cache/memory-cache';
import { CACHE_TTL, DATA_FRESHNESS_THRESHOLDS, POLLUTANT_NAMES } from '@/lib/constants';
import { haversineDistanceKm, formatDistanceKm, isValidCoordinate } from '@/lib/geo';

function computeFreshness(date: Date): DataFreshness {
  const age = Date.now() - date.getTime();
  if (age < 0) return 'UNKNOWN';
  if (age < DATA_FRESHNESS_THRESHOLDS.LIVE) return 'LIVE';
  if (age < DATA_FRESHNESS_THRESHOLDS.RECENT) return 'RECENT';
  if (age < DATA_FRESHNESS_THRESHOLDS.STALE) return 'STALE';
  return 'OUTDATED';
}

export class AirQualityService {
  private readonly provider = getAirQualityProvider();

  /**
   * Get current air quality for a city (e.g. "Delhi") or station code.
   */
  public async getCurrentAirQuality(params: {
    city?: string;
    stationCode?: string;
  }): Promise<AirQualitySnapshotDto | null> {
    const targetCity = params.city || 'Delhi';
    const cacheKey = `aqi:current:${params.stationCode || targetCity.toLowerCase()}`;

    // 1. Check cache
    const cached = globalCache.get<AirQualitySnapshotDto>(cacheKey);
    if (cached) {
      return {
        ...cached,
        measurementStatus: 'cached',
      };
    }

    // 2. Fetch observations
    let station: MonitoringStationDto | null = null;
    let observations: AirQualityObservation[] = [];

    if (params.stationCode) {
      observations = await this.provider.getObservationsByStation(params.stationCode);
      const stations = await this.provider.getStations();
      station = stations.find((s) => s.stationCode.toLowerCase() === params.stationCode!.toLowerCase()) || null;
    } else {
      const cityResult = await this.provider.getObservationsByCity(targetCity);
      if (cityResult) {
        station = cityResult.station;
        observations = cityResult.observations;
      }
    }

    if (!station || observations.length === 0) {
      return null;
    }

    // 3. Calculate CPCB AQI using our deterministic domain engine
    const aqiResult = calculateCpcbAqi(observations);

    // 4. Derive timestamps and freshness
    const latestObsDate = observations.reduce(
      (latest, obs) => (obs.observedAt > latest ? obs.observedAt : latest),
      observations[0]?.observedAt ?? new Date()
    );

    const freshness = computeFreshness(latestObsDate);
    const measurementStatus: MeasurementStatus = freshness === 'LIVE' ? 'live' : 'cached';

    const categoryKey = aqiResult.category;
    const healthAdvisory = categoryKey
      ? CPCB_HEALTH_ADVISORIES[categoryKey]
      : 'Insufficient air quality data to formulate health guidance.';

    const dominantName = aqiResult.dominantPollutant
      ? POLLUTANT_NAMES[aqiResult.dominantPollutant]
      : null;

    const categoryLabel = aqiResult.category
      ? aqiResult.category.charAt(0) + aqiResult.category.slice(1).toLowerCase().replace(/_/g, ' ')
      : 'Unavailable';

    const snapshot: AirQualitySnapshotDto = {
      station,
      city: station.city,
      state: station.state,
      aqi: aqiResult.aqi,
      category: aqiResult.category,
      categoryLabel,
      dominantPollutant: aqiResult.dominantPollutant,
      dominantPollutantName: dominantName,
      pollutants: aqiResult.pollutantDetails,
      sufficiency: aqiResult.sufficiency,
      measurementTimestamp: latestObsDate.toISOString(),
      retrievalTimestamp: new Date().toISOString(),
      dataFreshness: freshness,
      measurementStatus,
      sourceAttribution: `${station.provider} • Station: ${station.name} (${station.stationCode})`,
      healthAdvisory,
    };

    // 5. Save to Cache
    globalCache.set(cacheKey, snapshot, CACHE_TTL.CURRENT_AQI);

    return snapshot;
  }

  private readonly fallbackProvider = new MockAirQualityProvider();

  /**
   * Search / list locations with optional text search and geodesic proximity sorting
   */
  public async searchLocations(queryOrParams?: string | {
    query?: string;
    lat?: number;
    lon?: number;
    maxDistanceKm?: number;
  }): Promise<Array<MonitoringStationDto & { distanceKm?: number | null; distanceFormatted?: string }>> {
    const params = typeof queryOrParams === 'string' ? { query: queryOrParams } : queryOrParams;
    const stations = await this.provider.getStations();
    let filtered = stations;

    if (params?.query) {
      const lower = params.query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.city.toLowerCase().includes(lower) ||
          s.name.toLowerCase().includes(lower) ||
          s.state.toLowerCase().includes(lower) ||
          s.stationCode.toLowerCase().includes(lower)
      );
    }

    if (isValidCoordinate(params?.lat, params?.lon)) {
      const maxDist = params?.maxDistanceKm ?? 200;
      const withDistance = filtered
        .map((station) => {
          const distanceKm = haversineDistanceKm(
            params!.lat,
            params!.lon,
            station.latitude,
            station.longitude
          );
          return {
            ...station,
            distanceKm,
            distanceFormatted: formatDistanceKm(distanceKm),
          };
        })
        .filter((s) => s.distanceKm === null || s.distanceKm <= maxDist)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });

      return withDistance;
    }

    return filtered;
  }

  /**
   * Discover nearby monitoring stations based on browser device geolocation coordinates
   */
  public async findNearbyStations(
    lat: number,
    lon: number,
    maxDistanceKm = 100
  ): Promise<NearbyStationDto[]> {
    if (!isValidCoordinate(lat, lon)) {
      return [];
    }

    const stations = await this.searchLocations({ lat, lon, maxDistanceKm });
    const nearby: NearbyStationDto[] = [];

    for (const s of stations.slice(0, 5)) {
      const current = await this.getCurrentAirQuality({ stationCode: s.stationCode });
      nearby.push({
        station: s,
        distanceKm: s.distanceKm ?? null,
        distanceFormatted: s.distanceFormatted ?? formatDistanceKm(s.distanceKm),
        currentAqi: current?.aqi ?? null,
        category: current?.category ?? null,
        dominantPollutant: current?.dominantPollutant ?? null,
      });
    }

    return nearby;
  }

  /**
   * Get historical air quality records and trends for an explicitly requested location and time range
   */
  public async getHistoricalAirQuality(params: {
    city?: string;
    stationCode?: string;
    range?: HistoryTimeRange;
  }): Promise<HistoricalAirQualityDto | null> {
    const range: HistoryTimeRange = params.range || '24h';
    const targetLoc = (params.stationCode || params.city || 'Delhi').toLowerCase();
    const cacheKey = `aqi:history:${targetLoc}:${range}`;

    // 1. Check cache
    const cached = globalCache.get<HistoricalAirQualityDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Fetch from active provider
    let historical = await this.provider.getHistoricalData({
      stationCode: params.stationCode,
      city: params.city || (params.stationCode ? undefined : 'Delhi'),
      range,
    });

    // 3. Fallback to reference mock provider if active provider does not support historical series
    if (!historical) {
      historical = await this.fallbackProvider.getHistoricalData({
        stationCode: params.stationCode,
        city: params.city || (params.stationCode ? undefined : 'Delhi'),
        range,
      });
    }

    if (!historical) {
      return null;
    }

    // 4. Save to cache (1 hour TTL)
    globalCache.set(cacheKey, historical, 3600 * 1000);

    return historical;
  }

  /**
   * Compare 2 to 5 locations side by side with current measurements and health risk levels
   */
  public async compareLocations(cities: string[]): Promise<LocationComparisonDto> {
    const uniqueCities = Array.from(new Set(cities.map((c) => c.trim()).filter(Boolean)));
    const snapshots = await Promise.all(
      uniqueCities.map((city) => this.getCurrentAirQuality({ city }))
    );

    const validSnapshots = snapshots.filter((s): s is AirQualitySnapshotDto => s !== null);

    const items: LocationComparisonItemDto[] = validSnapshots.map((s) => {
      const pm25 = s.pollutants.find((p) => p.pollutant === 'PM2_5')?.concentration ?? null;
      const pm10 = s.pollutants.find((p) => p.pollutant === 'PM10')?.concentration ?? null;

      return {
        city: s.city,
        stationName: s.station.name,
        stationCode: s.station.stationCode,
        aqi: s.aqi,
        category: s.category,
        categoryLabel: s.categoryLabel,
        dominantPollutant: s.dominantPollutant,
        pm25,
        pm10,
        healthAdvisory: s.healthAdvisory,
        dataFreshness: s.dataFreshness,
      };
    });

    // Rank highest and lowest
    const sortedByAqi = [...items].filter((i) => i.aqi !== null).sort((a, b) => b.aqi! - a.aqi!);
    const highest = sortedByAqi[0];
    const lowest = sortedByAqi[sortedByAqi.length - 1];

    return {
      comparedAt: new Date().toISOString(),
      locations: items,
      highestAqiCity: highest?.city ?? null,
      lowestAqiCity: lowest?.city ?? null,
      cleanestStation: lowest?.stationName ?? null,
      mostPollutedStation: highest?.stationName ?? null,
    };
  }
}

export const airQualityService = new AirQualityService();
