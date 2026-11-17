import type { AqiCategoryKey, PollutantType } from '../types';

export interface BreakpointRange {
  cLow: number;  // Concentration lower breakpoint
  cHigh: number; // Concentration upper breakpoint
  iLow: number;  // Sub-index lower breakpoint
  iHigh: number; // Sub-index upper breakpoint
  category: AqiCategoryKey;
}

/**
 * Official Central Pollution Control Board (CPCB) Breakpoint Table.
 * Reference: National Air Quality Index, CPCB, Ministry of Environment, Forest & Climate Change, 2014.
 */
export const CPCB_BREAKPOINTS: Record<PollutantType, BreakpointRange[]> = {
  PM2_5: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 250.001, cHigh: 380, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  PM10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 430.001, cHigh: 510, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  NO2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 400.001, cHigh: 500, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  SO2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 1600.001, cHigh: 2000, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  CO: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 1.001, cHigh: 2.0, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 2.001, cHigh: 10.0, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 10.001, cHigh: 17.0, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 17.001, cHigh: 34.0, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 34.001, cHigh: 50.0, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  O3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 748.001, cHigh: 1000, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  NH3: [
    { cLow: 0, cHigh: 200, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 201, cHigh: 400, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 401, cHigh: 800, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 801, cHigh: 1200, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 1201, cHigh: 1800, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 1800.001, cHigh: 2400, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
  PB: [
    { cLow: 0, cHigh: 0.5, iLow: 0, iHigh: 50, category: 'GOOD' },
    { cLow: 0.501, cHigh: 1.0, iLow: 51, iHigh: 100, category: 'SATISFACTORY' },
    { cLow: 1.001, cHigh: 2.0, iLow: 101, iHigh: 200, category: 'MODERATELY_POLLUTED' },
    { cLow: 2.001, cHigh: 3.0, iLow: 201, iHigh: 300, category: 'POOR' },
    { cLow: 3.001, cHigh: 3.5, iLow: 301, iHigh: 400, category: 'VERY_POOR' },
    { cLow: 3.501, cHigh: 5.0, iLow: 401, iHigh: 500, category: 'SEVERE' },
  ],
};

/**
 * Health guidance statements recommended for each CPCB category
 */
export const CPCB_HEALTH_ADVISORIES: Record<AqiCategoryKey, string> = {
  GOOD: 'Minimal impact. Air quality is considered satisfactory, and air pollution poses little or no risk.',
  SATISFACTORY: 'Minor breathing discomfort to sensitive people. Consider normal outdoor activities.',
  MODERATELY_POLLUTED: 'Breathing discomfort to people with lungs, asthma, and heart diseases. Children and elderly should consider limiting prolonged outdoor exertion.',
  POOR: 'Breathing discomfort to most people on prolonged exposure. Avoid strenuous outdoor activities.',
  VERY_POOR: 'Respiratory illness on prolonged exposure. Effect may be more pronounced in people with lung and heart diseases. Limit outdoor exposure.',
  SEVERE: 'Affects healthy people and seriously impacts those with existing diseases. Avoid outdoor exertion and keep indoor air clean.',
};
