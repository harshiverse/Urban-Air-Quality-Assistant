import { describe, it, expect } from 'vitest';
import { airQualityService } from '@/server/services/air-quality.service';
import type { HistoryTimeRange } from '@/features/air-quality/types';

describe('Historical Air Quality & Comparison Service', () => {
  describe('getHistoricalAirQuality', () => {
    const ranges: HistoryTimeRange[] = ['24h', '7d', '30d', '90d'];

    ranges.forEach((range) => {
      it(`retrieves realistic historical timeline for ${range}`, async () => {
        const history = await airQualityService.getHistoricalAirQuality({
          city: 'Delhi',
          range,
        });

        expect(history).not.toBeNull();
        expect(history?.location).toBe('Delhi');
        expect(history?.range).toBe(range);
        expect(history?.dataPoints.length).toBeGreaterThan(0);
        expect(history?.summary).toBeDefined();

        // Check summary values
        expect(history?.summary.totalPoints).toBe(history?.dataPoints.length);
        expect(history?.summary.completenessPercentage).toBeGreaterThanOrEqual(75);
        expect(history?.summary.minAqi).not.toBeNull();
        expect(history?.summary.maxAqi).not.toBeNull();
        expect(history?.summary.avgAqi).not.toBeNull();
        expect(history?.summary.maxAqi!).toBeGreaterThanOrEqual(history?.summary.minAqi!);
      });
    });

    it('faithfully preserves sensor calibration gaps without fabricating data', async () => {
      const history = await airQualityService.getHistoricalAirQuality({
        city: 'Delhi',
        range: '24h',
      });

      expect(history).not.toBeNull();
      const points = history!.dataPoints;

      // Look for intentional simulated missing sensor points
      const missingPoints = points.filter((p) => p.isMissing === true);
      if (missingPoints.length > 0) {
        missingPoints.forEach((p) => {
          expect(p.aqi).toBeNull();
          expect(p.pm25).toBeNull();
          expect(p.category).toBeNull();
        });
      }
    });

    it('includes station attribution and provenance metadata', async () => {
      const history = await airQualityService.getHistoricalAirQuality({
        city: 'Bengaluru',
        range: '24h',
      });

      expect(history?.station).toBeDefined();
      expect(history?.station.stationCode).toBeDefined();
      expect(history?.sourceAttribution).toContain('Historic observations');
    });
  });

  describe('Location Geodesic Proximity Search', () => {
    it('returns stations sorted by distance when coordinates are provided', async () => {
      // Coordinates near Delhi: 28.6139, 77.2090
      const stations = await airQualityService.searchLocations({
        lat: 28.6139,
        lon: 77.2090,
        maxDistanceKm: 100,
      });

      expect(stations.length).toBeGreaterThan(0);
      expect(stations[0]?.city).toBe('Delhi');
      expect(stations[0]?.distanceKm).toBeDefined();
      expect(stations[0]?.distanceKm!).toBeLessThan(50);
      expect(stations[0]?.distanceFormatted).toBeDefined();

      // Ensure monotonically increasing distance
      for (let i = 1; i < stations.length; i++) {
        if (stations[i]?.distanceKm !== null && stations[i - 1]?.distanceKm !== null) {
          expect(stations[i]?.distanceKm!).toBeGreaterThanOrEqual(stations[i - 1]?.distanceKm!);
        }
      }
    });

    it('findNearbyStations returns stations within radius', async () => {
      const nearby = await airQualityService.findNearbyStations(28.6139, 77.2090, 50);
      expect(nearby.length).toBeGreaterThan(0);
      nearby.forEach((s) => {
        expect(s.distanceKm).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('compareLocations', () => {
    it('compares multiple locations side by side and detects cleanest & most polluted', async () => {
      const comparison = await airQualityService.compareLocations(['Delhi', 'Mumbai', 'Bengaluru']);

      expect(comparison).toBeDefined();
      expect(comparison.locations.length).toBe(3);
      expect(comparison.comparedAt).toBeDefined();

      // Highest and lowest AQI city callouts
      expect(comparison.highestAqiCity).toBeDefined();
      expect(comparison.lowestAqiCity).toBeDefined();
      expect(comparison.cleanestStation).toBeDefined();
      expect(comparison.mostPollutedStation).toBeDefined();

      // Verify each item has required metrics
      comparison.locations.forEach((loc) => {
        expect(loc.city).toBeDefined();
        expect(loc.stationName).toBeDefined();
        expect(loc.healthAdvisory).toBeDefined();
      });
    });
  });
});
