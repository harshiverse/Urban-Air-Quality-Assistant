import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAirQualityCurrent } from '@/app/api/v1/air-quality/current/route';
import { GET as searchLocations } from '@/app/api/v1/locations/search/route';

describe('API Route Handlers', () => {
  describe('GET /api/v1/air-quality/current', () => {
    it('returns 200 with default city (Delhi) snapshot', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/air-quality/current');
      const res = await getAirQualityCurrent(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.city).toBe('Delhi');
      expect(json.data.aqi).toBeGreaterThan(0);
      expect(json.data.pollutants.length).toBeGreaterThanOrEqual(3);
      expect(json.data.category).toBeDefined();
    });

    it('returns 200 for specific city query (Bengaluru)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/air-quality/current?city=Bengaluru');
      const res = await getAirQualityCurrent(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.city).toBe('Bengaluru');
      expect(json.data.category).toBe('SATISFACTORY');
    });

    it('returns 404 for unknown city with no monitoring stations', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/air-quality/current?city=Atlantis');
      const res = await getAirQualityCurrent(req);

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/locations/search', () => {
    it('returns available stations list', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/locations/search?q=Delhi');
      const res = await searchLocations(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.results.length).toBeGreaterThan(0);
      expect(json.data.results[0].city).toBe('Delhi');
    });
  });
});
