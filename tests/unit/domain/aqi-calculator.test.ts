import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  calculateCpcbAqi,
  checkDataSufficiency,
  mapAqiToCategory,
} from '@/features/air-quality/domain/aqi-calculator';
import { AirQualityObservation } from '@/features/air-quality/types';

describe('CPCB AQI Calculation Engine', () => {
  describe('calculateSubIndex', () => {
    // PM2.5 breakpoints:
    // 0-30 -> 0-50 (Good)
    // 31-60 -> 51-100 (Satisfactory)
    // 61-90 -> 101-200 (Moderately Polluted)
    // 91-120 -> 201-300 (Poor)
    // 121-250 -> 301-400 (Very Poor)
    // 250+-380 -> 401-500 (Severe)
    it('calculates PM2.5 sub-index correctly at lower boundary', () => {
      const result = calculateSubIndex('PM2_5', 0, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(0);
      expect(result?.category).toBe('GOOD');
    });

    it('calculates PM2.5 sub-index correctly at upper Good boundary (30 µg/m³ -> 50)', () => {
      const result = calculateSubIndex('PM2_5', 30, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(50);
      expect(result?.category).toBe('GOOD');
    });

    it('calculates PM2.5 sub-index correctly at Satisfactory range (60 µg/m³ -> 100)', () => {
      const result = calculateSubIndex('PM2_5', 60, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(100);
      expect(result?.category).toBe('SATISFACTORY');
    });

    it('calculates PM2.5 sub-index correctly in Moderately Polluted range (75 µg/m³)', () => {
      // (200 - 101)/(90 - 61) * (75 - 61) + 101 = (99/29) * 14 + 101 = 47.79 + 101 = 149
      const result = calculateSubIndex('PM2_5', 75, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(149);
      expect(result?.category).toBe('MODERATELY_POLLUTED');
    });

    it('calculates PM2.5 sub-index correctly at Very Poor boundary (250 µg/m³ -> 400)', () => {
      const result = calculateSubIndex('PM2_5', 250, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(400);
      expect(result?.category).toBe('VERY_POOR');
    });

    it('calculates PM2.5 sub-index in Severe range (380 µg/m³ -> 500)', () => {
      const result = calculateSubIndex('PM2_5', 380, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(500);
      expect(result?.category).toBe('SEVERE');
    });

    it('handles PM2.5 concentrations exceeding 380 µg/m³ as Severe (>= 500)', () => {
      const result = calculateSubIndex('PM2_5', 450, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBeGreaterThanOrEqual(500);
      expect(result?.category).toBe('SEVERE');
    });

    // PM10 breakpoints:
    // 0-50 -> 0-50
    // 51-100 -> 51-100
    // 101-250 -> 101-200
    // 251-350 -> 201-300
    // 351-430 -> 301-400
    // 430+-510 -> 401-500
    it('calculates PM10 sub-index correctly across boundaries', () => {
      expect(calculateSubIndex('PM10', 50, 'µg/m³')?.subIndex).toBe(50);
      expect(calculateSubIndex('PM10', 100, 'µg/m³')?.subIndex).toBe(100);
      expect(calculateSubIndex('PM10', 250, 'µg/m³')?.subIndex).toBe(200);
      expect(calculateSubIndex('PM10', 350, 'µg/m³')?.subIndex).toBe(300);
      expect(calculateSubIndex('PM10', 430, 'µg/m³')?.subIndex).toBe(400);
    });

    // CO breakpoints (in mg/m³):
    // 0-1.0 -> 0-50
    // 1.0-2.0 -> 51-100
    it('calculates CO sub-index with unit conversion from µg/m³ to mg/m³', () => {
      // 1000 µg/m³ = 1.0 mg/m³ -> AQI 50
      const result = calculateSubIndex('CO', 1000, 'µg/m³');
      expect(result).not.toBeNull();
      expect(result?.subIndex).toBe(50);
      expect(result?.category).toBe('GOOD');
      expect(result?.normalizedConcentration).toBe(1.0);
    });

    it('returns null for negative concentration', () => {
      expect(calculateSubIndex('PM2_5', -5, 'µg/m³')).toBeNull();
    });
  });

  describe('checkDataSufficiency', () => {
    it('rejects if fewer than 3 pollutants are available', () => {
      const result = checkDataSufficiency(['PM2_5', 'NO2']);
      expect(result.isSufficient).toBe(false);
      expect(result.totalValidPollutants).toBe(2);
      expect(result.missingRequirements).toEqual(
        expect.arrayContaining([expect.stringContaining('minimum 3 required')])
      );
    });

    it('rejects if 3 pollutants are present but neither PM2.5 nor PM10 is included', () => {
      const result = checkDataSufficiency(['NO2', 'SO2', 'CO']);
      expect(result.isSufficient).toBe(false);
      expect(result.hasMandatoryParticlePollutant).toBe(false);
      expect(result.missingRequirements).toEqual(
        expect.arrayContaining([expect.stringContaining('Missing mandatory particulate matter')])
      );
    });

    it('approves when 3 pollutants including PM2.5 are present', () => {
      const result = checkDataSufficiency(['PM2_5', 'NO2', 'SO2']);
      expect(result.isSufficient).toBe(true);
      expect(result.totalValidPollutants).toBe(3);
      expect(result.hasMandatoryParticlePollutant).toBe(true);
      expect(result.missingRequirements).toHaveLength(0);
    });

    it('approves when 3 pollutants including PM10 are present', () => {
      const result = checkDataSufficiency(['PM10', 'CO', 'O3']);
      expect(result.isSufficient).toBe(true);
      expect(result.hasMandatoryParticlePollutant).toBe(true);
    });
  });

  describe('mapAqiToCategory', () => {
    it('maps correctly according to CPCB category boundaries', () => {
      expect(mapAqiToCategory(0)).toBe('GOOD');
      expect(mapAqiToCategory(50)).toBe('GOOD');
      expect(mapAqiToCategory(51)).toBe('SATISFACTORY');
      expect(mapAqiToCategory(100)).toBe('SATISFACTORY');
      expect(mapAqiToCategory(101)).toBe('MODERATELY_POLLUTED');
      expect(mapAqiToCategory(200)).toBe('MODERATELY_POLLUTED');
      expect(mapAqiToCategory(201)).toBe('POOR');
      expect(mapAqiToCategory(300)).toBe('POOR');
      expect(mapAqiToCategory(301)).toBe('VERY_POOR');
      expect(mapAqiToCategory(400)).toBe('VERY_POOR');
      expect(mapAqiToCategory(401)).toBe('SEVERE');
      expect(mapAqiToCategory(500)).toBe('SEVERE');
      expect(mapAqiToCategory(650)).toBe('SEVERE');
    });
  });

  describe('calculateCpcbAqi (End-to-End calculation)', () => {
    const now = new Date();

    it('applies Highest Valid Sub-index rule and identifies dominant pollutant', () => {
      const obs: AirQualityObservation[] = [
        {
          stationId: 'DL001',
          pollutantType: 'PM2_5',
          concentration: 142.5, // ~317 AQI (Very Poor)
          unit: 'µg/m³',
          averagingPeriod: '24h',
          observedAt: now,
          dataQualityFlag: 'VALID',
          sourceProvider: 'CPCB',
        },
        {
          stationId: 'DL001',
          pollutantType: 'PM10',
          concentration: 180.0, // ~153 AQI (Moderate)
          unit: 'µg/m³',
          averagingPeriod: '24h',
          observedAt: now,
          dataQualityFlag: 'VALID',
          sourceProvider: 'CPCB',
        },
        {
          stationId: 'DL001',
          pollutantType: 'NO2',
          concentration: 35.0, // ~44 AQI (Good)
          unit: 'µg/m³',
          averagingPeriod: '24h',
          observedAt: now,
          dataQualityFlag: 'VALID',
          sourceProvider: 'CPCB',
        },
      ];

      const result = calculateCpcbAqi(obs);

      expect(result.sufficiency.isSufficient).toBe(true);
      expect(result.dominantPollutant).toBe('PM2_5');
      expect(result.category).toBe('VERY_POOR');
      // Sub-index for PM2.5 at 142.5: (400-301)/(250-121) * (142.5-121) + 301 = 99/129 * 21.5 + 301 = 16.5 + 301 = 318
      expect(result.aqi).toBe(318);

      const dominantDetail = result.pollutantDetails.find((p) => p.pollutant === 'PM2_5');
      expect(dominantDetail?.isDominant).toBe(true);
      const pm10Detail = result.pollutantDetails.find((p) => p.pollutant === 'PM10');
      expect(pm10Detail?.isDominant).toBe(false);
    });

    it('returns null AQI when data is insufficient (never fabricates data)', () => {
      const insufficientObs: AirQualityObservation[] = [
        {
          stationId: 'DL001',
          pollutantType: 'PM2_5',
          concentration: 45.0,
          unit: 'µg/m³',
          averagingPeriod: '24h',
          observedAt: now,
          dataQualityFlag: 'VALID',
          sourceProvider: 'CPCB',
        },
      ];

      const result = calculateCpcbAqi(insufficientObs);
      expect(result.aqi).toBeNull();
      expect(result.category).toBeNull();
      expect(result.dominantPollutant).toBeNull();
      expect(result.sufficiency.isSufficient).toBe(false);
    });
  });
});
