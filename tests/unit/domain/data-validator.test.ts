import { describe, it, expect } from 'vitest';
import {
  validateObservation,
  deduplicateObservations,
} from '@/features/air-quality/domain/data-validator';
import { AirQualityObservation } from '@/features/air-quality/types';

describe('Data Validator', () => {
  const validDate = new Date();

  it('accepts valid observations within physical boundaries', () => {
    const res = validateObservation({
      pollutantType: 'PM2_5',
      concentration: 45.0,
      observedAt: validDate,
    });
    expect(res.isValid).toBe(true);
    expect(res.flag).toBe('VALID');
  });

  it('rejects negative concentration as INVALID', () => {
    const res = validateObservation({
      pollutantType: 'PM10',
      concentration: -12.5,
      observedAt: validDate,
    });
    expect(res.isValid).toBe(false);
    expect(res.flag).toBe('INVALID');
    expect(res.reason).toContain('Negative concentration');
  });

  it('rejects non-finite concentration as INVALID', () => {
    const res = validateObservation({
      pollutantType: 'CO',
      concentration: NaN,
      observedAt: validDate,
    });
    expect(res.isValid).toBe(false);
    expect(res.flag).toBe('INVALID');
  });

  it('rejects future timestamps (>5 minutes ahead) as INVALID', () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000);
    const res = validateObservation({
      pollutantType: 'NO2',
      concentration: 30,
      observedAt: futureDate,
    });
    expect(res.isValid).toBe(false);
    expect(res.flag).toBe('INVALID');
    expect(res.reason).toContain('future');
  });

  it('flags unusually high values as SUSPECT without outright rejecting', () => {
    const res = validateObservation({
      pollutantType: 'PM2_5',
      concentration: 1200, // Above maxSuspect (1000) but below maxExtreme (2500)
      observedAt: validDate,
    });
    expect(res.isValid).toBe(true);
    expect(res.flag).toBe('SUSPECT');
  });

  it('rejects impossible extreme values (>2500 for PM2.5)', () => {
    const res = validateObservation({
      pollutantType: 'PM2_5',
      concentration: 3000,
      observedAt: validDate,
    });
    expect(res.isValid).toBe(false);
    expect(res.flag).toBe('INVALID');
  });

  it('deduplicates observations favoring the latest timestamp', () => {
    const earlier = new Date('2026-11-17T10:00:00Z');
    const later = new Date('2026-11-17T11:00:00Z');

    const obs: AirQualityObservation[] = [
      {
        stationId: 'DL001',
        pollutantType: 'PM2_5',
        concentration: 50,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt: earlier,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
      {
        stationId: 'DL001',
        pollutantType: 'PM2_5',
        concentration: 75,
        unit: 'µg/m³',
        averagingPeriod: '24h',
        observedAt: later,
        dataQualityFlag: 'VALID',
        sourceProvider: 'CPCB',
      },
    ];

    const deduplicated = deduplicateObservations(obs);
    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0]?.concentration).toBe(75);
    expect(deduplicated[0]?.observedAt).toEqual(later);
  });
});
