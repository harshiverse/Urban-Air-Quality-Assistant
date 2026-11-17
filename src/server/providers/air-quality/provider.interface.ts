import type {
  AirQualityObservation,
  MonitoringStationDto,
} from '@/features/air-quality/types';

export interface ProviderMetadata {
  name: string;
  sourceAttribution: string;
  updateFrequency: string;
  isAvailable: boolean;
  rateLimitPerMinute: number;
}

export interface IAirQualityProvider {
  /**
   * Unique identifier for this provider (e.g. "DATA_GOV_IN", "MOCK", "OPENAQ")
   */
  readonly id: string;

  /**
   * Get provider metadata and status
   */
  getMetadata(): ProviderMetadata;

  /**
   * Fetch current air quality observations for a specific station code
   */
  getObservationsByStation(
    stationCode: string
  ): Promise<AirQualityObservation[]>;

  /**
   * Fetch current air quality observations for a city (e.g. "Delhi", "Mumbai")
   */
  getObservationsByCity(
    city: string
  ): Promise<{ station: MonitoringStationDto; observations: AirQualityObservation[] } | null>;

  /**
   * List all available monitoring stations from this provider
   */
  getStations(city?: string): Promise<MonitoringStationDto[]>;
}
