/**
 * Application-wide constants
 */

// AQI Category Thresholds (CPCB)
export const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 50, label: 'Good', color: '#55a84f' },
  SATISFACTORY: { min: 51, max: 100, label: 'Satisfactory', color: '#a3c853' },
  MODERATELY_POLLUTED: { min: 101, max: 200, label: 'Moderately Polluted', color: '#fff833' },
  POOR: { min: 201, max: 300, label: 'Poor', color: '#f29c33' },
  VERY_POOR: { min: 301, max: 400, label: 'Very Poor', color: '#e93f33' },
  SEVERE: { min: 401, max: 500, label: 'Severe', color: '#af2d24' },
} as const;

// Pollutant Names
export const POLLUTANT_NAMES = {
  PM2_5: 'PM2.5 (Particulate Matter < 2.5µm)',
  PM10: 'PM10 (Particulate Matter < 10µm)',
  NO2: 'Nitrogen Dioxide',
  SO2: 'Sulphur Dioxide',
  CO: 'Carbon Monoxide',
  O3: 'Ozone',
  NH3: 'Ammonia',
  PB: 'Lead',
} as const;

// Pollutant Units
export const POLLUTANT_UNITS = {
  PM2_5: 'µg/m³',
  PM10: 'µg/m³',
  NO2: 'µg/m³',
  SO2: 'µg/m³',
  CO: 'mg/m³',
  O3: 'µg/m³',
  NH3: 'µg/m³',
  PB: 'µg/m³',
} as const;

// Cache TTLs (milliseconds)
export const CACHE_TTL = {
  CURRENT_AQI: 15 * 60 * 1000, // 15 minutes
  HISTORICAL_DATA: 24 * 60 * 60 * 1000, // 24 hours
  WEATHER: 30 * 60 * 1000, // 30 minutes
  STATION_METADATA: 24 * 60 * 60 * 1000, // 24 hours
  LOCATION_SEARCH: 60 * 60 * 1000, // 1 hour
} as const;

// Rate Limits (requests per minute)
export const RATE_LIMITS = {
  AQI_CURRENT: 60,
  AQI_HISTORY: 30,
  LOCATION_SEARCH: 60,
  AI_ASSISTANT: 10,
} as const;

// API Timeouts (milliseconds)
export const API_TIMEOUTS = {
  DATA_PROVIDER: 10000, // 10 seconds
  AI_PROVIDER: 30000, // 30 seconds
  WEATHER_PROVIDER: 5000, // 5 seconds
} as const;

// Data freshness thresholds (milliseconds)
export const DATA_FRESHNESS_THRESHOLDS = {
  LIVE: 60 * 60 * 1000, // 1 hour
  RECENT: 3 * 60 * 60 * 1000, // 3 hours
  STALE: 6 * 60 * 60 * 1000, // 6 hours
  // Anything older is OUTDATED
} as const;
