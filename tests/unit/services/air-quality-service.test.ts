import { describe, it, expect } from 'vitest';
import { airQualityService } from '@/server/services/air-quality.service';

describe('AirQualityService', () => {
  it('retrieves current air quality for Delhi with full snapshot', async () => {
    const snapshot = await airQualityService.getCurrentAirQuality({ city: 'Delhi' });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.city).toBe('Delhi');
    expect(snapshot?.station.name).toContain('Delhi');
    expect(snapshot?.aqi).toBeGreaterThan(0);
    expect(snapshot?.category).not.toBeNull();
    expect(snapshot?.dominantPollutant).not.toBeNull();
    expect(snapshot?.pollutants.length).toBeGreaterThanOrEqual(3);
    expect(snapshot?.healthAdvisory).toBeTruthy();
    expect(snapshot?.sourceAttribution).toContain('CPCB');
  });

  it('retrieves current air quality for Bengaluru with satisfactory levels', async () => {
    const snapshot = await airQualityService.getCurrentAirQuality({ city: 'Bengaluru' });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.city).toBe('Bengaluru');
    expect(snapshot?.station.name).toContain('Bengaluru');
    expect(snapshot?.category).toBe('SATISFACTORY');
  });

  it('searches locations correctly', async () => {
    const delhiStations = await airQualityService.searchLocations('Delhi');
    expect(delhiStations.length).toBeGreaterThan(0);
    expect(delhiStations[0]?.city).toBe('Delhi');

    const kaStations = await airQualityService.searchLocations('Bengaluru');
    expect(kaStations.length).toBeGreaterThan(0);
    expect(kaStations[0]?.state).toBe('Karnataka');
  });
});
