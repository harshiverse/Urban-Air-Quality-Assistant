import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchLocations } from '@/app/api/v1/locations/search/route';

describe('Locations & Station Search API (/api/v1/locations/search)', () => {
  it('returns 200 with all monitoring stations when no query is specified', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/locations/search');
    const res = await searchLocations(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.total).toBeGreaterThan(0);
    expect(Array.isArray(json.data.results)).toBe(true);
    expect(json.data.results[0]).toHaveProperty('stationCode');
    expect(json.data.results[0]).toHaveProperty('city');
  });

  it('filters monitoring stations by city search query', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/locations/search?q=Bengaluru');
    const res = await searchLocations(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.results.length).toBeGreaterThan(0);
    expect(json.data.results.every((s: { city: string }) => s.city.toLowerCase().includes('bengaluru'))).toBe(true);
  });

  it('calculates geodesic proximity distance when latitude and longitude are supplied', async () => {
    // Delhi coordinates
    const req = new NextRequest('http://localhost:3000/api/v1/locations/search?lat=28.6139&lon=77.2090&maxDistanceKm=200');
    const res = await searchLocations(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.results.length).toBeGreaterThan(0);
    // Nearest station should have distanceKm populated
    const first = json.data.results[0];
    expect(first.distanceKm).toBeDefined();
    expect(first.distanceFormatted).toBeDefined();
    expect(first.city).toBe('Delhi');
  });

  it('returns 400 validation error when latitude is invalid', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/locations/search?lat=999&lon=77.2090');
    const res = await searchLocations(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });
});
