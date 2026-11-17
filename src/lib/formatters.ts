/**
 * Utility formatters for AQI values, concentrations, timestamps, and categories.
 */
import { formatDistanceToNowStrict } from 'date-fns';

import { AQI_CATEGORIES, DATA_FRESHNESS_THRESHOLDS } from '@/lib/constants';

/**
 * Format an AQI value as a rounded integer string.
 * Returns "N/A" for null values.
 */
export function formatAqiValue(value: number | null): string {
  if (value === null) return 'N/A';
  return Math.round(value).toString();
}

/**
 * Format a pollutant concentration with its unit.
 * Returns "N/A" for null values.
 */
export function formatConcentration(
  value: number | null,
  unit: string
): string {
  if (value === null) return 'N/A';
  // Use at most 1 decimal place; drop trailing ".0"
  const formatted =
    Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${formatted} ${unit}`;
}

/**
 * Format a date as a human-readable relative time string.
 * Returns "Unknown" for null or invalid dates.
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (date === null) return 'Unknown';

  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(parsed.getTime())) return 'Unknown';

  return `${formatDistanceToNowStrict(parsed)} ago`;
}

type AqiCategoryKey = keyof typeof AQI_CATEGORIES;

interface AqiCategoryInfo {
  key: string;
  label: string;
  color: string;
}

/**
 * Map a numeric AQI value to its CPCB category.
 * Values outside 0-500 are clamped to the nearest boundary category.
 */
export function getAqiCategory(value: number): AqiCategoryInfo {
  const entries = Object.entries(AQI_CATEGORIES) as [
    AqiCategoryKey,
    (typeof AQI_CATEGORIES)[AqiCategoryKey],
  ][];

  for (const [key, cat] of entries) {
    if (value >= cat.min && value <= cat.max) {
      return { key, label: cat.label, color: cat.color };
    }
  }

  // Clamp: below 0 → GOOD, above 500 → SEVERE
  if (value < 0) {
    return {
      key: 'GOOD',
      label: AQI_CATEGORIES.GOOD.label,
      color: AQI_CATEGORIES.GOOD.color,
    };
  }
  return {
    key: 'SEVERE',
    label: AQI_CATEGORIES.SEVERE.label,
    color: AQI_CATEGORIES.SEVERE.color,
  };
}

type DataFreshness = 'live' | 'recent' | 'stale' | 'outdated' | 'unknown';

/**
 * Determine data freshness based on the observation timestamp.
 * Uses thresholds from DATA_FRESHNESS_THRESHOLDS.
 */
export function getDataFreshness(
  observedAt: Date | string | null
): DataFreshness {
  if (observedAt === null) return 'unknown';

  const parsed =
    typeof observedAt === 'string' ? new Date(observedAt) : observedAt;
  if (isNaN(parsed.getTime())) return 'unknown';

  const ageMs = Date.now() - parsed.getTime();

  if (ageMs < 0) return 'unknown'; // future timestamp
  if (ageMs < DATA_FRESHNESS_THRESHOLDS.LIVE) return 'live';
  if (ageMs < DATA_FRESHNESS_THRESHOLDS.RECENT) return 'recent';
  if (ageMs < DATA_FRESHNESS_THRESHOLDS.STALE) return 'stale';
  return 'outdated';
}

/** Map from AQI_CATEGORIES key to Tailwind AQI color class */
const CATEGORY_KEY_TO_BG_CLASS: Record<string, string> = {
  GOOD: 'bg-aqi-good',
  SATISFACTORY: 'bg-aqi-satisfactory',
  MODERATELY_POLLUTED: 'bg-aqi-moderate',
  POOR: 'bg-aqi-poor',
  VERY_POOR: 'bg-aqi-veryPoor',
  SEVERE: 'bg-aqi-severe',
};

/** Map from AQI_CATEGORIES key to Tailwind AQI text color class */
const CATEGORY_KEY_TO_TEXT_CLASS: Record<string, string> = {
  GOOD: 'text-aqi-good',
  SATISFACTORY: 'text-aqi-satisfactory',
  MODERATELY_POLLUTED: 'text-aqi-moderate',
  POOR: 'text-aqi-poor',
  VERY_POOR: 'text-aqi-veryPoor',
  SEVERE: 'text-aqi-severe',
};

/**
 * Get the Tailwind background color class for an AQI category key.
 * Falls back to bg-muted for unknown categories.
 */
export function getAqiCategoryColorClass(category: string): string {
  return CATEGORY_KEY_TO_BG_CLASS[category] ?? 'bg-muted';
}

/**
 * Get the Tailwind text color class for an AQI category key.
 * Falls back to text-muted-foreground for unknown categories.
 */
export function getAqiCategoryTextClass(category: string): string {
  return CATEGORY_KEY_TO_TEXT_CLASS[category] ?? 'text-muted-foreground';
}

/** Map from AQI_CATEGORIES key to badge variant name used by Badge component */
const CATEGORY_KEY_TO_BADGE_VARIANT: Record<string, string> = {
  GOOD: 'good',
  SATISFACTORY: 'satisfactory',
  MODERATELY_POLLUTED: 'moderate',
  POOR: 'poor',
  VERY_POOR: 'veryPoor',
  SEVERE: 'severe',
};

/**
 * Get the Badge variant name for an AQI category key.
 * Falls back to 'outline' for unknown categories.
 */
export function getAqiBadgeVariant(category: string): string {
  return CATEGORY_KEY_TO_BADGE_VARIANT[category] ?? 'outline';
}
