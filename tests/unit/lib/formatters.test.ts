import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatAqiValue,
  formatConcentration,
  formatRelativeTime,
  getAqiCategory,
  getDataFreshness,
  getAqiCategoryColorClass,
  getAqiCategoryTextClass,
  getAqiBadgeVariant,
} from '@/lib/formatters';

describe('Formatters', () => {
  describe('formatAqiValue', () => {
    it('returns "N/A" for null', () => {
      expect(formatAqiValue(null)).toBe('N/A');
    });

    it('rounds floating point AQI values', () => {
      expect(formatAqiValue(85.4)).toBe('85');
      expect(formatAqiValue(85.6)).toBe('86');
    });

    it('handles boundary values', () => {
      expect(formatAqiValue(0)).toBe('0');
      expect(formatAqiValue(500)).toBe('500');
    });
  });

  describe('formatConcentration', () => {
    it('returns "N/A" for null', () => {
      expect(formatConcentration(null, 'µg/m³')).toBe('N/A');
    });

    it('formats integer values without decimal places', () => {
      expect(formatConcentration(45, 'µg/m³')).toBe('45 µg/m³');
    });

    it('formats float values with one decimal place', () => {
      expect(formatConcentration(45.67, 'µg/m³')).toBe('45.7 µg/m³');
      expect(formatConcentration(1.23, 'mg/m³')).toBe('1.2 mg/m³');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Unknown" for null or invalid dates', () => {
      expect(formatRelativeTime(null)).toBe('Unknown');
      expect(formatRelativeTime('invalid-date')).toBe('Unknown');
    });

    it('formats relative time correctly', () => {
      const tenMinutesAgo = new Date('2026-11-17T11:50:00Z');
      expect(formatRelativeTime(tenMinutesAgo)).toBe('10 minutes ago');
    });
  });

  describe('getAqiCategory', () => {
    it('correctly maps values in 0-50 range to GOOD', () => {
      expect(getAqiCategory(0).key).toBe('GOOD');
      expect(getAqiCategory(25).key).toBe('GOOD');
      expect(getAqiCategory(50).key).toBe('GOOD');
      expect(getAqiCategory(50).label).toBe('Good');
    });

    it('correctly maps values in 51-100 range to SATISFACTORY', () => {
      expect(getAqiCategory(51).key).toBe('SATISFACTORY');
      expect(getAqiCategory(100).key).toBe('SATISFACTORY');
    });

    it('correctly maps values in 101-200 range to MODERATELY_POLLUTED', () => {
      expect(getAqiCategory(101).key).toBe('MODERATELY_POLLUTED');
      expect(getAqiCategory(200).key).toBe('MODERATELY_POLLUTED');
    });

    it('correctly maps values in 201-300 range to POOR', () => {
      expect(getAqiCategory(201).key).toBe('POOR');
      expect(getAqiCategory(300).key).toBe('POOR');
    });

    it('correctly maps values in 301-400 range to VERY_POOR', () => {
      expect(getAqiCategory(301).key).toBe('VERY_POOR');
      expect(getAqiCategory(400).key).toBe('VERY_POOR');
    });

    it('correctly maps values in 401-500 range to SEVERE', () => {
      expect(getAqiCategory(401).key).toBe('SEVERE');
      expect(getAqiCategory(500).key).toBe('SEVERE');
    });

    it('clamps values below 0 to GOOD and above 500 to SEVERE', () => {
      expect(getAqiCategory(-10).key).toBe('GOOD');
      expect(getAqiCategory(600).key).toBe('SEVERE');
    });
  });

  describe('getDataFreshness', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "unknown" for null or future dates', () => {
      expect(getDataFreshness(null)).toBe('unknown');
      expect(getDataFreshness(new Date('2026-11-17T13:00:00Z'))).toBe('unknown');
    });

    it('returns "live" for observations < 1 hour old', () => {
      const halfHourAgo = new Date('2026-11-17T11:30:00Z');
      expect(getDataFreshness(halfHourAgo)).toBe('live');
    });

    it('returns "recent" for observations 1-3 hours old', () => {
      const twoHoursAgo = new Date('2026-11-17T10:00:00Z');
      expect(getDataFreshness(twoHoursAgo)).toBe('recent');
    });

    it('returns "stale" for observations 3-6 hours old', () => {
      const fourHoursAgo = new Date('2026-11-17T08:00:00Z');
      expect(getDataFreshness(fourHoursAgo)).toBe('stale');
    });

    it('returns "outdated" for observations > 6 hours old', () => {
      const sevenHoursAgo = new Date('2026-11-17T05:00:00Z');
      expect(getDataFreshness(sevenHoursAgo)).toBe('outdated');
    });
  });

  describe('CSS class mappings', () => {
    it('returns valid Tailwind background color classes', () => {
      expect(getAqiCategoryColorClass('GOOD')).toBe('bg-aqi-good');
      expect(getAqiCategoryColorClass('SEVERE')).toBe('bg-aqi-severe');
      expect(getAqiCategoryColorClass('UNKNOWN')).toBe('bg-muted');
    });

    it('returns valid Tailwind text color classes', () => {
      expect(getAqiCategoryTextClass('GOOD')).toBe('text-aqi-good');
      expect(getAqiCategoryTextClass('SEVERE')).toBe('text-aqi-severe');
      expect(getAqiCategoryTextClass('UNKNOWN')).toBe('text-muted-foreground');
    });

    it('returns valid badge variants', () => {
      expect(getAqiBadgeVariant('GOOD')).toBe('good');
      expect(getAqiBadgeVariant('MODERATELY_POLLUTED')).toBe('moderate');
      expect(getAqiBadgeVariant('UNKNOWN')).toBe('outline');
    });
  });
});
