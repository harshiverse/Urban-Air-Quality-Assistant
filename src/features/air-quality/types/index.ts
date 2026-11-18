/**
 * Air Quality Domain Types
 * Based on CPCB (Central Pollution Control Board) National AQI standard for India
 */

export type PollutantType =
  | 'PM2_5'
  | 'PM10'
  | 'NO2'
  | 'SO2'
  | 'CO'
  | 'O3'
  | 'NH3'
  | 'PB';

export type DataQualityFlag =
  | 'VALID'
  | 'SUSPECT'
  | 'INVALID'
  | 'MISSING'
  | 'UNCHECKED';

export type AqiCategoryKey =
  | 'GOOD'
  | 'SATISFACTORY'
  | 'MODERATELY_POLLUTED'
  | 'POOR'
  | 'VERY_POOR'
  | 'SEVERE';

export type DataFreshness =
  | 'LIVE'
  | 'RECENT'
  | 'STALE'
  | 'OUTDATED'
  | 'UNKNOWN';

export type MeasurementStatus =
  | 'live'
  | 'cached'
  | 'historical'
  | 'forecast'
  | 'estimated'
  | 'unavailable';

/**
 * Single pollutant observation from a monitoring station
 */
export interface AirQualityObservation {
  id?: string;
  stationId: string;
  pollutantType: PollutantType;
  concentration: number;
  unit: string;
  averagingPeriod: string;
  observedAt: Date;
  dataQualityFlag: DataQualityFlag;
  sourceProvider: string;
  metadata?: Record<string, unknown>;
}

/**
 * Calculated sub-index for an individual pollutant
 */
export interface PollutantSubIndex {
  pollutant: PollutantType;
  concentration: number;
  unit: string;
  subIndex: number;
  category: AqiCategoryKey;
  averagingPeriod: string;
  isDominant: boolean;
  dataQualityFlag: DataQualityFlag;
}

/**
 * Sufficiency check result
 */
export interface DataSufficiencyResult {
  isSufficient: boolean;
  totalValidPollutants: number;
  hasMandatoryParticlePollutant: boolean;
  missingRequirements: string[];
}

/**
 * Complete AQI calculation result
 */
export interface AqiCalculationResult {
  aqi: number | null;
  category: AqiCategoryKey | null;
  dominantPollutant: PollutantType | null;
  subIndices: Record<PollutantType, number | null>;
  pollutantDetails: PollutantSubIndex[];
  sufficiency: DataSufficiencyResult;
  calculatedAt: Date;
}

/**
 * Monitoring station information
 */
export interface MonitoringStationDto {
  id: string;
  stationCode: string;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  provider: string;
  isActive: boolean;
}

/**
 * Complete normalized Air Quality Snapshot
 */
export interface AirQualitySnapshotDto {
  station: MonitoringStationDto;
  city: string;
  state: string;
  aqi: number | null;
  category: AqiCategoryKey | null;
  categoryLabel: string;
  dominantPollutant: PollutantType | null;
  dominantPollutantName: string | null;
  pollutants: PollutantSubIndex[];
  sufficiency: DataSufficiencyResult;
  measurementTimestamp: string;
  retrievalTimestamp: string;
  dataFreshness: DataFreshness;
  measurementStatus: MeasurementStatus;
  sourceAttribution: string;
  healthAdvisory: string;
}

/**
 * Historical time range options
 */
export type HistoryTimeRange = '24h' | '7d' | '30d' | '90d';

/**
 * Single historical time point with AQI and individual pollutant readings
 */
export interface HistoricalDataPoint {
  timestamp: string;
  label: string; // e.g. "14:00", "Nov 17", "W46"
  aqi: number | null;
  category: AqiCategoryKey | null;
  dominantPollutant: PollutantType | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  nh3: number | null;
  isMissing?: boolean;
}

/**
 * Historical statistics summary
 */
export interface HistoricalSummary {
  minAqi: number | null;
  maxAqi: number | null;
  avgAqi: number | null;
  dominantPollutant: PollutantType | null;
  dominantPollutantName: string | null;
  completenessPercentage: number;
  totalPoints: number;
  validPoints: number;
}

/**
 * Complete Historical Air Quality DTO returned by API and Services
 */
export interface HistoricalAirQualityDto {
  location: string;
  station: MonitoringStationDto;
  range: HistoryTimeRange;
  dataPoints: HistoricalDataPoint[];
  summary: HistoricalSummary;
  retrievedAt: string;
  sourceAttribution: string;
}

/**
 * Nearby station information including calculated geodesic distance
 */
export interface NearbyStationDto {
  station: MonitoringStationDto;
  distanceKm: number | null;
  distanceFormatted: string;
  currentAqi: number | null;
  category: AqiCategoryKey | null;
  dominantPollutant: PollutantType | null;
}

/**
 * Comparative data point for multi-location comparisons
 */
export interface LocationComparisonItemDto {
  city: string;
  stationName: string;
  stationCode: string;
  aqi: number | null;
  category: AqiCategoryKey | null;
  categoryLabel: string;
  dominantPollutant: PollutantType | null;
  pm25: number | null;
  pm10: number | null;
  healthAdvisory: string;
  dataFreshness: DataFreshness;
}

/**
 * Multi-city comparison response DTO
 */
export interface LocationComparisonDto {
  comparedAt: string;
  locations: LocationComparisonItemDto[];
  highestAqiCity: string | null;
  lowestAqiCity: string | null;
  cleanestStation: string | null;
  mostPollutedStation: string | null;
}
