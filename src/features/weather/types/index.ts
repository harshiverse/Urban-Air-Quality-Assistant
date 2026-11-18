/**
 * Weather & Environmental Context Types
 * Supports atmospheric correlation with CPCB air pollution measurements
 */

export type WindSpeedCategory = 'CALM' | 'LIGHT' | 'MODERATE' | 'STRONG';
export type InversionRisk = 'LOW' | 'MODERATE' | 'HIGH';
export type DispersionPotential = 'POOR' | 'FAIR' | 'GOOD';

export interface WeatherObservationDto {
  city: string;
  temperature: number; // in Celsius
  feelsLike: number; // in Celsius
  humidity: number; // in percentage (0-100)
  windSpeed: number; // in km/h
  windDirection: string; // e.g. 'NW', 'NNW', 'CALM'
  windDegree: number; // 0-360 degrees
  windCategory: WindSpeedCategory;
  pressure: number; // in hPa
  condition: string; // e.g. 'Haze', 'Mist', 'Clear', 'Rain'
  visibilityKm: number;
  inversionRisk: InversionRisk;
  dispersionPotential: DispersionPotential;
  observedAt: string; // ISO-8601
  sourceAttribution: string;
}

export interface WeatherCorrelationContext {
  temperatureInversionNote: string;
  dispersionSummary: string;
  windEffect: string;
  humidityEffect: string;
}
