import type { IAirQualityProvider } from './provider.interface';
import { MockAirQualityProvider } from './mock/mock.provider';
import { DataGovInProvider } from './data-gov-in/data-gov-in.provider';
import { OpenAQProvider } from './openaq/openaq.provider';
import { env } from '@/lib/env';

/**
 * Composite Fallback Provider:
 * Attempts primary external provider first; if it returns null, falls back to Mock provider.
 */
class CompositeFallbackProvider implements IAirQualityProvider {
  public readonly id = 'COMPOSITE_AIR_QUALITY_PROVIDER';

  constructor(
    private readonly primary: IAirQualityProvider,
    private readonly fallback: IAirQualityProvider
  ) {}

  public getMetadata() {
    return this.primary.getMetadata();
  }

  public async getStations(city?: string) {
    const stations = await this.primary.getStations(city);
    if (stations.length > 0) return stations;
    return this.fallback.getStations(city);
  }

  public async getObservationsByStation(stationCode: string) {
    const obs = await this.primary.getObservationsByStation(stationCode);
    if (obs.length > 0) return obs;
    return this.fallback.getObservationsByStation(stationCode);
  }

  public async getObservationsByCity(city: string) {
    const result = await this.primary.getObservationsByCity(city);
    if (result && result.observations.length > 0) return result;
    return this.fallback.getObservationsByCity(city);
  }
}

/**
 * Creates and configures the appropriate Air Quality provider instance.
 */
export function getAirQualityProvider(): IAirQualityProvider {
  const mockProvider = new MockAirQualityProvider();

  if (env.DATA_GOV_IN_API_KEY) {
    const dataGovProvider = new DataGovInProvider(env.DATA_GOV_IN_API_KEY);
    return new CompositeFallbackProvider(dataGovProvider, mockProvider);
  }

  if (env.OPENAQ_API_KEY) {
    const openaqProvider = new OpenAQProvider(env.OPENAQ_API_KEY);
    return new CompositeFallbackProvider(openaqProvider, mockProvider);
  }

  return mockProvider;
}
