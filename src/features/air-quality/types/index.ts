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
