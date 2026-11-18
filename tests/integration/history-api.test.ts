import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getHistory } from '@/app/api/v1/air-quality/history/route';

describe('Historical Air Quality API Route (/api/v1/air-quality/history)', () => {
  it('returns 200 with valid historical timeline for Delhi 24h', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/history?city=Delhi&range=24h');
    const res = await getHistory(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.location).toBe('Delhi');
    expect(json.data.range).toBe('24h');
    expect(json.data.dataPoints.length).toBeGreaterThan(0);
    expect(json.data.summary).toBeDefined();
    expect(json.data.summary.completenessPercentage).toBeGreaterThanOrEqual(75);
  });

  it('returns 200 for 7d time range', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/history?city=Bengaluru&range=7d');
    const res = await getHistory(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.range).toBe('7d');
    expect(json.data.dataPoints.length).toBeGreaterThanOrEqual(7);
  });

  it('returns 400 for invalid time range parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/history?city=Delhi&range=500days');
    const res = await getHistory(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown city or station', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/air-quality/history?stationCode=NONEXISTENT_STATION');
    const res = await getHistory(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });
});
