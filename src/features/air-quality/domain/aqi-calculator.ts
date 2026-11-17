import type {
  AirQualityObservation,
  AqiCalculationResult,
  AqiCategoryKey,
  DataSufficiencyResult,
  PollutantSubIndex,
  PollutantType,
} from '../types';
import { CPCB_BREAKPOINTS } from './breakpoints';
import { convertToStandardUnit } from './unit-converter';
import { validateObservation, deduplicateObservations } from './data-validator';

/**
 * Calculate the CPCB sub-index for a single pollutant.
 *
 * Formula: I = [ (I_hi - I_lo) / (B_hi - B_lo) * (C - B_lo) ] + I_lo
 */
export function calculateSubIndex(
  pollutant: PollutantType,
  rawConcentration: number,
  unit?: string
): { subIndex: number; category: AqiCategoryKey; normalizedConcentration: number; standardUnit: string } | null {
  // 1. Convert to standard unit if unit is provided
  const { concentration, unit: standardUnit } = unit
    ? convertToStandardUnit(pollutant, rawConcentration, unit)
    : { concentration: rawConcentration, unit: 'µg/m³' };

  if (concentration < 0 || !Number.isFinite(concentration)) {
    return null;
  }

  const ranges = CPCB_BREAKPOINTS[pollutant];
  if (!ranges || ranges.length === 0) {
    return null;
  }

  // 2. Find matching breakpoint range
  for (const r of ranges) {
    if (concentration >= r.cLow && concentration <= r.cHigh) {
      const subIndex = Math.round(
        ((r.iHigh - r.iLow) / (r.cHigh - r.cLow)) * (concentration - r.cLow) + r.iLow
      );
      return {
        subIndex,
        category: r.category,
        normalizedConcentration: concentration,
        standardUnit,
      };
    }
  }

  // 3. Concentration exceeds maximum defined breakpoint (Severe+)
  const highestRange = ranges[ranges.length - 1];
  if (highestRange && concentration > highestRange.cHigh) {
    // Extrapolate slope from severe range, with minimum 500
    const slope = (highestRange.iHigh - highestRange.iLow) / (highestRange.cHigh - highestRange.cLow);
    const subIndex = Math.round(highestRange.iHigh + slope * (concentration - highestRange.cHigh));
    return {
      subIndex: Math.max(500, subIndex),
      category: 'SEVERE',
      normalizedConcentration: concentration,
      standardUnit,
    };
  }

  return null;
}

/**
 * Validate CPCB data sufficiency requirements:
 * 1. Minimum 3 valid pollutants must be present.
 * 2. At least one must be a particulate matter pollutant (PM2.5 or PM10).
 */
export function checkDataSufficiency(
  validPollutants: PollutantType[]
): DataSufficiencyResult {
  const uniquePollutants = Array.from(new Set(validPollutants));
  const hasPM25 = uniquePollutants.includes('PM2_5');
  const hasPM10 = uniquePollutants.includes('PM10');
  const hasMandatoryParticlePollutant = hasPM25 || hasPM10;
  const totalValidPollutants = uniquePollutants.length;

  const missingRequirements: string[] = [];

  if (totalValidPollutants < 3) {
    missingRequirements.push(
      `Insufficient pollutants: found ${totalValidPollutants}, minimum 3 required by CPCB`
    );
  }

  if (!hasMandatoryParticlePollutant) {
    missingRequirements.push(
      'Missing mandatory particulate matter pollutant (PM2.5 or PM10 required by CPCB)'
    );
  }

  return {
    isSufficient: totalValidPollutants >= 3 && hasMandatoryParticlePollutant,
    totalValidPollutants,
    hasMandatoryParticlePollutant,
    missingRequirements,
  };
}

/**
 * Map an AQI value to its CPCB category.
 */
export function mapAqiToCategory(aqi: number): AqiCategoryKey {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'SATISFACTORY';
  if (aqi <= 200) return 'MODERATELY_POLLUTED';
  if (aqi <= 300) return 'POOR';
  if (aqi <= 400) return 'VERY_POOR';
  return 'SEVERE';
}

/**
 * Priority order for breaking ties when determining dominant pollutant
 */
const DOMINANT_PRIORITY: PollutantType[] = [
  'PM2_5',
  'PM10',
  'NO2',
  'O3',
  'SO2',
  'CO',
  'NH3',
  'PB',
];

/**
 * Complete CPCB AQI Calculation Engine.
 *
 * Takes a list of raw pollutant observations, validates them, computes sub-indices,
 * enforces data sufficiency rules, and determines overall AQI & dominant pollutant.
 */
export function calculateCpcbAqi(
  rawObservations: AirQualityObservation[]
): AqiCalculationResult {
  const calculatedAt = new Date();

  // 1. Deduplicate observations
  const observations = deduplicateObservations(rawObservations);

  // 2. Validate and compute sub-indices for each pollutant
  const pollutantDetails: PollutantSubIndex[] = [];
  const subIndicesMap: Record<PollutantType, number | null> = {
    PM2_5: null,
    PM10: null,
    NO2: null,
    SO2: null,
    CO: null,
    O3: null,
    NH3: null,
    PB: null,
  };

  const validPollutantsForSufficiency: PollutantType[] = [];

  for (const obs of observations) {
    const valResult = validateObservation(obs);
    if (!valResult.isValid) continue;

    const subIndexResult = calculateSubIndex(
      obs.pollutantType,
      obs.concentration,
      obs.unit
    );

    if (subIndexResult !== null) {
      subIndicesMap[obs.pollutantType] = subIndexResult.subIndex;
      validPollutantsForSufficiency.push(obs.pollutantType);

      pollutantDetails.push({
        pollutant: obs.pollutantType,
        concentration: subIndexResult.normalizedConcentration,
        unit: subIndexResult.standardUnit,
        subIndex: subIndexResult.subIndex,
        category: subIndexResult.category,
        averagingPeriod: obs.averagingPeriod,
        isDominant: false, // will update below
        dataQualityFlag: valResult.flag,
      });
    }
  }

  // 3. Check CPCB Data Sufficiency
  const sufficiency = checkDataSufficiency(validPollutantsForSufficiency);

  // 4. If data is insufficient, return null AQI state
  if (!sufficiency.isSufficient || pollutantDetails.length === 0) {
    return {
      aqi: null,
      category: null,
      dominantPollutant: null,
      subIndices: subIndicesMap,
      pollutantDetails,
      sufficiency,
      calculatedAt,
    };
  }

  // 5. Determine Overall AQI: Highest valid sub-index rule
  let maxSubIndex = -1;
  const candidates: PollutantType[] = [];

  for (const p of pollutantDetails) {
    if (p.subIndex > maxSubIndex) {
      maxSubIndex = p.subIndex;
      candidates.length = 0;
      candidates.push(p.pollutant);
    } else if (p.subIndex === maxSubIndex) {
      candidates.push(p.pollutant);
    }
  }

  // Break ties using priority list
  let dominantPollutant: PollutantType = candidates[0] ?? 'PM2_5';
  if (candidates.length > 1) {
    for (const priority of DOMINANT_PRIORITY) {
      if (candidates.includes(priority)) {
        dominantPollutant = priority;
        break;
      }
    }
  }

  // Mark dominant in pollutant details
  for (const p of pollutantDetails) {
    if (p.pollutant === dominantPollutant) {
      p.isDominant = true;
    }
  }

  const category = mapAqiToCategory(maxSubIndex);

  return {
    aqi: maxSubIndex,
    category,
    dominantPollutant,
    subIndices: subIndicesMap,
    pollutantDetails,
    sufficiency,
    calculatedAt,
  };
}
