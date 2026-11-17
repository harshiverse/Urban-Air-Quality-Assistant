import type { AirQualityObservation, DataQualityFlag, PollutantType } from '../types';

/**
 * Plausible physical maximums for urban environments (well above severe thresholds)
 * Values above these are flagged as SUSPECT or INVALID.
 */
export const POLLUTANT_PHYSICAL_LIMITS: Record<
  PollutantType,
  { min: number; maxSuspect: number; maxExtreme: number }
> = {
  PM2_5: { min: 0, maxSuspect: 1000, maxExtreme: 2500 }, // µg/m³
  PM10: { min: 0, maxSuspect: 1500, maxExtreme: 3500 },  // µg/m³
  NO2: { min: 0, maxSuspect: 1000, maxExtreme: 2000 },   // µg/m³
  SO2: { min: 0, maxSuspect: 2000, maxExtreme: 4000 },   // µg/m³
  CO: { min: 0, maxSuspect: 50, maxExtreme: 100 },       // mg/m³
  O3: { min: 0, maxSuspect: 800, maxExtreme: 1500 },     // µg/m³
  NH3: { min: 0, maxSuspect: 2000, maxExtreme: 4000 },   // µg/m³
  PB: { min: 0, maxSuspect: 10, maxExtreme: 50 },        // µg/m³
};

export interface ValidationResult {
  isValid: boolean;
  flag: DataQualityFlag;
  reason?: string;
}

/**
 * Validate a single pollutant observation.
 */
export function validateObservation(
  obs: Pick<AirQualityObservation, 'pollutantType' | 'concentration' | 'observedAt'>
): ValidationResult {
  const { pollutantType, concentration, observedAt } = obs;

  // 1. Non-finite values
  if (typeof concentration !== 'number' || !Number.isFinite(concentration) || Number.isNaN(concentration)) {
    return {
      isValid: false,
      flag: 'INVALID',
      reason: 'Concentration is not a finite number',
    };
  }

  // 2. Negative values
  if (concentration < 0) {
    return {
      isValid: false,
      flag: 'INVALID',
      reason: `Negative concentration (${concentration}) is physically impossible`,
    };
  }

  // 3. Timestamp checks
  const now = Date.now();
  const obsTime = observedAt instanceof Date ? observedAt.getTime() : new Date(observedAt).getTime();

  if (Number.isNaN(obsTime)) {
    return {
      isValid: false,
      flag: 'INVALID',
      reason: 'Invalid timestamp',
    };
  }

  // Future timestamp tolerance: allow up to 5 minutes clock skew
  if (obsTime > now + 5 * 60 * 1000) {
    return {
      isValid: false,
      flag: 'INVALID',
      reason: 'Observation timestamp is in the future',
    };
  }

  // 4. Physical range limits
  const limits = POLLUTANT_PHYSICAL_LIMITS[pollutantType];
  if (limits) {
    if (concentration > limits.maxExtreme) {
      return {
        isValid: false,
        flag: 'INVALID',
        reason: `Concentration ${concentration} exceeds absolute physical ceiling ${limits.maxExtreme}`,
      };
    }

    if (concentration > limits.maxSuspect) {
      return {
        isValid: true,
        flag: 'SUSPECT',
        reason: `Concentration ${concentration} is unusually high (suspect range)`,
      };
    }
  }

  return {
    isValid: true,
    flag: 'VALID',
  };
}

/**
 * Deduplicate observations: when multiple observations exist for the same pollutant,
 * keep the one with the latest timestamp and best data quality flag.
 */
export function deduplicateObservations(
  observations: AirQualityObservation[]
): AirQualityObservation[] {
  const map = new Map<PollutantType, AirQualityObservation>();

  for (const obs of observations) {
    const existing = map.get(obs.pollutantType);
    if (!existing) {
      map.set(obs.pollutantType, obs);
      continue;
    }

    // Keep the one with a newer timestamp
    const existingTime = new Date(existing.observedAt).getTime();
    const newTime = new Date(obs.observedAt).getTime();

    if (newTime > existingTime) {
      map.set(obs.pollutantType, obs);
    } else if (newTime === existingTime) {
      // If timestamps tie, prefer VALID over SUSPECT/INVALID
      if (obs.dataQualityFlag === 'VALID' && existing.dataQualityFlag !== 'VALID') {
        map.set(obs.pollutantType, obs);
      }
    }
  }

  return Array.from(map.values());
}
