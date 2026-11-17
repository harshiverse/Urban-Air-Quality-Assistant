import type {
  AirQualityObservation,
  AirQualitySnapshotDto,
  DataFreshness,
  MeasurementStatus,
  MonitoringStationDto,
} from '@/features/air-quality/types';
import { calculateCpcbAqi } from '@/features/air-quality/domain/aqi-calculator';
import { CPCB_HEALTH_ADVISORIES } from '@/features/air-quality/domain/breakpoints';
import { getAirQualityProvider } from '../providers/air-quality/provider.factory';
import { globalCache } from '../cache/memory-cache';
import { CACHE_TTL, DATA_FRESHNESS_THRESHOLDS, POLLUTANT_NAMES } from '@/lib/constants';

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

  /**
   * Search / list locations
   */
  public async searchLocations(query?: string) {
    const stations = await this.provider.getStations();
    if (!query) return stations;

    const lower = query.toLowerCase();
    return stations.filter(
      (s) =>
        s.city.toLowerCase().includes(lower) ||
        s.name.toLowerCase().includes(lower) ||
        s.state.toLowerCase().includes(lower) ||
        s.stationCode.toLowerCase().includes(lower)
    );
  }
}

export const airQualityService = new AirQualityService();
