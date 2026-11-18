import { describe, it, expect } from 'vitest';
import { weatherService } from '@/server/services/weather.service';

describe('Weather Service & Atmospheric Correlation (Module F)', () => {
  it('retrieves meteorological parameters for Delhi', async () => {
    const weather = await weatherService.getWeatherForCity('Delhi');

    expect(weather).not.toBeNull();
    expect(weather?.city).toBe('Delhi');
    expect(weather?.temperature).toBeDefined();
    expect(weather?.humidity).toBeGreaterThan(0);
    expect(weather?.windSpeed).toBeDefined();
    expect(weather?.windDirection).toBeDefined();
    expect(weather?.inversionRisk).toBe('HIGH');
    expect(weather?.dispersionPotential).toBe('POOR');
  });

  it('retrieves coastal ventilation parameters for Mumbai', async () => {
    const weather = await weatherService.getWeatherForCity('Mumbai');

    expect(weather).not.toBeNull();
    expect(weather?.windSpeed).toBeGreaterThan(10);
    expect(weather?.inversionRisk).toBe('LOW');
    expect(weather?.dispersionPotential).toBe('GOOD');
  });

  it('computes scientific correlation context between weather and AQI', async () => {
    const weather = await weatherService.getWeatherForCity('Delhi');
    expect(weather).not.toBeNull();

    const correlation = weatherService.getCorrelationContext(weather!, 340);
    expect(correlation.temperatureInversionNote).toContain('inversion');
    expect(correlation.dispersionSummary).toContain('ventilation');
    expect(correlation.windEffect).toContain('km/h');
    expect(correlation.humidityEffect).toContain('%');
  });

  it('provides reliable fallback when OpenWeatherMap API key is absent', async () => {
    const { OpenWeatherProvider } = await import(
      '@/server/providers/weather/open-weather/open-weather.provider'
    );
    const provider = new OpenWeatherProvider(undefined);
    const observation = await provider.getWeatherByCity('Bengaluru');

    expect(observation).not.toBeNull();
    expect(observation?.city).toBe('Bengaluru');
    expect(observation?.temperature).toBeGreaterThan(0);
    expect(observation?.windSpeed).toBeDefined();
    expect(observation?.inversionRisk).toBeDefined();
  });
});
