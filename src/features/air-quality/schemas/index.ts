import { z } from 'zod';

export const PollutantTypeSchema = z.enum([
  'PM2_5',
  'PM10',
  'NO2',
  'SO2',
  'CO',
  'O3',
  'NH3',
  'PB',
]);

export const DataQualityFlagSchema = z.enum([
  'VALID',
  'SUSPECT',
  'INVALID',
  'MISSING',
  'UNCHECKED',
]);

export const AqiCategorySchema = z.enum([
  'GOOD',
  'SATISFACTORY',
  'MODERATELY_POLLUTED',
  'POOR',
  'VERY_POOR',
  'SEVERE',
]);

export const AirQualityObservationSchema = z.object({
  stationId: z.string().min(1),
  pollutantType: PollutantTypeSchema,
  concentration: z.number().finite().min(0, 'Concentration cannot be negative'),
  unit: z.string().min(1),
  averagingPeriod: z.string().default('24h'),
  observedAt: z.coerce.date(),
  dataQualityFlag: DataQualityFlagSchema.default('UNCHECKED'),
  sourceProvider: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const CurrentAqiQuerySchema = z.object({
  city: z.string().trim().min(1).max(100).optional(),
  stationCode: z.string().trim().min(1).max(50).optional(),
});

export const LocationSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  maxDistanceKm: z.coerce.number().positive().max(500).default(100),
});

export const HistoryTimeRangeSchema = z.enum(['24h', '7d', '30d', '90d']);

export const HistoryQuerySchema = z.object({
  city: z.string().trim().min(1).max(100).optional(),
  stationCode: z.string().trim().min(1).max(50).optional(),
  range: HistoryTimeRangeSchema.default('24h'),
  pollutant: PollutantTypeSchema.optional(),
});

export const LocationComparisonQuerySchema = z.object({
  cities: z
    .string()
    .transform((val) => val.split(',').map((c) => c.trim()).filter(Boolean))
    .pipe(z.array(z.string().min(1)).min(2, 'At least 2 locations required for comparison').max(5, 'Maximum 5 locations can be compared')),
});
