import { z } from 'zod';

/**
 * Environment Variables Schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:postgres@localhost:5432/airquality'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Data Providers (optional in development for mock data)
  DATA_GOV_IN_API_KEY: z.string().optional(),
  OPENAQ_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),

  // AI Provider
  AI_PROVIDER: z.enum(['openai', 'anthropic']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

/**
 * Validate environment variables
 * Throws error if validation fails
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
  }

  // Additional validation: require API key for selected AI provider
  if (parsed.data.AI_PROVIDER === 'openai' && !parsed.data.OPENAI_API_KEY) {
    console.warn(
      '⚠️  OPENAI_API_KEY not set. AI assistant will not function until key is provided.'
    );
  }

  if (parsed.data.AI_PROVIDER === 'anthropic' && !parsed.data.ANTHROPIC_API_KEY) {
    console.warn(
      '⚠️  ANTHROPIC_API_KEY not set. AI assistant will not function until key is provided.'
    );
  }

  return parsed.data;
}

/**
 * Validated and typed environment variables
 * Available throughout the application
 */
export const env = validateEnv();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;
