import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getComparison } from '@/app/api/v1/air-quality/compare/route';

describe('Location Comparison API Route (/api/v1/air-quality/compare)', () => {
  it('returns 200 with comparative matrix for valid cities', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/compare?cities=Delhi,Mumbai,Bengaluru');
    const res = await getComparison(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.locations.length).toBe(3);
    expect(json.data.comparedAt).toBeDefined();
    expect(json.data.highestAqiCity).toBeDefined();
    expect(json.data.lowestAqiCity).toBeDefined();
    expect(json.data.cleanestStation).toBeDefined();
    expect(json.data.mostPollutedStation).toBeDefined();
  });

  it('returns 400 when cities parameter is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/compare');
    const res = await getComparison(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when fewer than 2 cities are provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/compare?cities=Delhi');
    const res = await getComparison(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when more than 5 cities are provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/compare?cities=Delhi,Mumbai,Bengaluru,Chennai,Kolkata,Hyderabad');
    const res = await getComparison(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });
});
