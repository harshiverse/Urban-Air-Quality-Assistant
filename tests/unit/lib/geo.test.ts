import { describe, it, expect } from 'vitest';
import { haversineDistanceKm, isValidCoordinate, formatDistanceKm } from '@/lib/geo';

describe('Geodesic Navigation Utilities (geo.ts)', () => {
  describe('haversineDistanceKm', () => {
    it('returns 0 for identical points', () => {
      const dist = haversineDistanceKm(28.6139, 77.2090, 28.6139, 77.2090);
      expect(dist).toBe(0);
    });

    it('calculates approximately correct distance between Delhi and Mumbai', () => {
      // Delhi: 28.6139, 77.2090 | Mumbai: 19.0760, 72.8777 (~1148 km)
      const dist = haversineDistanceKm(28.6139, 77.2090, 19.0760, 72.8777);
      expect(dist).not.toBeNull();
      expect(dist!).toBeGreaterThan(1140);
      expect(dist!).toBeLessThan(1160);
    });

    it('calculates short city distances accurately', () => {
      // Connaught Place to Anand Vihar (~12 km)
      const dist = haversineDistanceKm(28.6315, 77.2167, 28.6469, 77.3160);
      expect(dist).not.toBeNull();
      expect(dist!).toBeGreaterThan(9);
      expect(dist!).toBeLessThan(14);
    });

    it('returns null when any coordinate is missing or invalid', () => {
      expect(haversineDistanceKm(null, 77.2, 19.0, 72.8)).toBeNull();
      expect(haversineDistanceKm(28.6, undefined, 19.0, 72.8)).toBeNull();
      expect(haversineDistanceKm(28.6, 77.2, NaN, 72.8)).toBeNull();
      expect(haversineDistanceKm(95, 77.2, 19.0, 72.8)).toBeNull(); // lat > 90
    });
  });

  describe('isValidCoordinate', () => {
    it('returns true for valid global coordinates', () => {
      expect(isValidCoordinate(28.6139, 77.2090)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(-90, 180)).toBe(true);
      expect(isValidCoordinate(90, -180)).toBe(true);
    });

    it('returns false for out-of-range coordinates', () => {
      expect(isValidCoordinate(90.1, 77)).toBe(false);
      expect(isValidCoordinate(-90.1, 77)).toBe(false);
      expect(isValidCoordinate(28, 180.1)).toBe(false);
      expect(isValidCoordinate(28, -180.1)).toBe(false);
    });

    it('returns false for null, undefined, or NaN', () => {
      expect(isValidCoordinate(null, 77)).toBe(false);
      expect(isValidCoordinate(28, undefined)).toBe(false);
      expect(isValidCoordinate(NaN, 77)).toBe(false);
      expect(isValidCoordinate(28, NaN)).toBe(false);
    });
  });

  describe('formatDistanceKm', () => {
    it('formats distances less than 1 km in meters', () => {
      expect(formatDistanceKm(0.45)).toBe('450 m away');
      expect(formatDistanceKm(0.08)).toBe('80 m away');
    });

    it('formats distances 1 km and greater with 1 decimal place', () => {
      expect(formatDistanceKm(2.45)).toBe('2.5 km away');
      expect(formatDistanceKm(12.04)).toBe('12.0 km away');
      expect(formatDistanceKm(1148.2)).toBe('1148.2 km away');
    });

    it('returns default fallback for null or undefined distance', () => {
      expect(formatDistanceKm(null)).toBe('Distance unavailable');
      expect(formatDistanceKm(undefined)).toBe('Distance unavailable');
    });
  });
});
