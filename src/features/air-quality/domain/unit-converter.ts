import type { PollutantType } from '../types';

/**
 * Standard unit expected by CPCB methodology for each pollutant
 */
export const STANDARD_UNITS: Record<PollutantType, string> = {
  PM2_5: 'µg/m³',
  PM10: 'µg/m³',
  NO2: 'µg/m³',
  SO2: 'µg/m³',
  CO: 'mg/m³', // CO is measured in mg/m³ per CPCB standard
  O3: 'µg/m³',
  NH3: 'µg/m³',
  PB: 'µg/m³',
};

/**
 * Molecular weights (g/mol) at standard conditions (25°C, 1 atm)
 */
const MOLECULAR_WEIGHTS: Partial<Record<PollutantType, number>> = {
  CO: 28.01,
  NO2: 46.01,
  SO2: 64.07,
  O3: 48.0,
  NH3: 17.03,
};

const MOLAR_VOLUME_AT_STP = 24.45; // L/mol at 25°C and 101.325 kPa

/**
 * Normalize concentration from provider unit to CPCB standard unit.
 *
 * @param pollutant Pollutant type
 * @param concentration Numeric concentration value
 * @param fromUnit Unit provided by the data source
 * @returns Converted concentration in CPCB standard unit
 */
export function convertToStandardUnit(
  pollutant: PollutantType,
  concentration: number,
  fromUnit: string
): { concentration: number; unit: string } {
  const targetUnit = STANDARD_UNITS[pollutant];
  const cleanFromUnit = fromUnit.trim().toLowerCase();

  // If already standard unit
  if (
    cleanFromUnit === targetUnit.toLowerCase() ||
    (targetUnit === 'µg/m³' && (cleanFromUnit === 'ug/m3' || cleanFromUnit === 'µg/m3' || cleanFromUnit === 'microgram/m3')) ||
    (targetUnit === 'mg/m³' && (cleanFromUnit === 'mg/m3' || cleanFromUnit === 'milligram/m3'))
  ) {
    return { concentration, unit: targetUnit };
  }

  // CO: µg/m³ to mg/m³
  if (pollutant === 'CO') {
    if (cleanFromUnit === 'ug/m3' || cleanFromUnit === 'µg/m³' || cleanFromUnit === 'µg/m3') {
      return { concentration: concentration / 1000, unit: targetUnit };
    }
    if (cleanFromUnit === 'ppm') {
      // 1 ppm CO = 1.145 mg/m³
      const mw = MOLECULAR_WEIGHTS.CO!;
      return { concentration: (concentration * mw) / MOLAR_VOLUME_AT_STP, unit: targetUnit };
    }
    if (cleanFromUnit === 'ppb') {
      const mw = MOLECULAR_WEIGHTS.CO!;
      return { concentration: (concentration * mw) / (MOLAR_VOLUME_AT_STP * 1000), unit: targetUnit };
    }
  }

  // Other gases: ppm / ppb to µg/m³
  const mw = MOLECULAR_WEIGHTS[pollutant];
  if (mw) {
    if (cleanFromUnit === 'ppm') {
      return {
        concentration: (concentration * mw * 1000) / MOLAR_VOLUME_AT_STP,
        unit: targetUnit,
      };
    }
    if (cleanFromUnit === 'ppb') {
      return {
        concentration: (concentration * mw) / MOLAR_VOLUME_AT_STP,
        unit: targetUnit,
      };
    }
    if (cleanFromUnit === 'mg/m3' || cleanFromUnit === 'mg/m³') {
      return {
        concentration: concentration * 1000,
        unit: targetUnit,
      };
    }
  }

  // If unit cannot be converted safely, return as is with standard unit warning
  return { concentration, unit: targetUnit };
}
