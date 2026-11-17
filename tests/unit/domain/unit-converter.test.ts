import { describe, it, expect } from 'vitest';
import {
  convertToStandardUnit,
  STANDARD_UNITS,
} from '@/features/air-quality/domain/unit-converter';

describe('Unit Converter', () => {
  it('keeps standard units intact', () => {
    const res = convertToStandardUnit('PM2_5', 45, 'µg/m³');
    expect(res.concentration).toBe(45);
    expect(res.unit).toBe(STANDARD_UNITS.PM2_5);
  });

  it('converts CO from µg/m³ to standard mg/m³', () => {
    // 2500 µg/m³ -> 2.5 mg/m³
    const res = convertToStandardUnit('CO', 2500, 'µg/m³');
    expect(res.concentration).toBe(2.5);
    expect(res.unit).toBe('mg/m³');
  });

  it('converts CO from ppm to standard mg/m³ at STP', () => {
    // 1 ppm CO * (28.01 / 24.45) = ~1.1456 mg/m³
    const res = convertToStandardUnit('CO', 1, 'ppm');
    expect(res.unit).toBe('mg/m³');
    expect(res.concentration).toBeCloseTo(1.1456, 3);
  });

  it('converts NO2 from ppm to µg/m³', () => {
    // 1 ppm NO2 * (46.01 * 1000 / 24.45) = ~1881.8 µg/m³
    const res = convertToStandardUnit('NO2', 0.05, 'ppm');
    expect(res.unit).toBe('µg/m³');
    expect(res.concentration).toBeCloseTo(94.09, 1);
  });
});
