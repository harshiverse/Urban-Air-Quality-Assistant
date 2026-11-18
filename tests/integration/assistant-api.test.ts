import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as assistantHandler } from '@/app/api/v1/assistant/route';

describe('AI Assistant API Route (/api/v1/assistant)', () => {
  it('returns 200 with grounded response for valid message', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.1',
      },
      body: JSON.stringify({
        message: 'What is the current air quality in Delhi?',
        location: 'Delhi',
      }),
    });

    const res = await assistantHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.reply).toBeDefined();
    expect(json.data.groundingContext).toBeDefined();
    expect(json.data.groundingContext.location).toBe('Delhi');
    expect(json.data.suggestions.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 400 for empty message', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.2',
      },
      body: JSON.stringify({
        message: '   ',
        location: 'Delhi',
      }),
    });

    const res = await assistantHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for message exceeding 500 characters', async () => {
    const longMessage = 'A'.repeat(501);
    const req = new NextRequest('http://localhost:3000/api/v1/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.3',
      },
      body: JSON.stringify({
        message: longMessage,
        location: 'Delhi',
      }),
    });

    const res = await assistantHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('enforces rate limiting when exceeding request threshold', async () => {
    const clientIp = '192.168.1.99';
    let lastStatus = 200;

    // Send 22 rapid requests to trip the 20-req/min rate limit
    for (let i = 0; i < 22; i++) {
      const req = new NextRequest('http://localhost:3000/api/v1/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': clientIp,
        },
        body: JSON.stringify({
          message: 'Status check',
          location: 'Delhi',
        }),
      });

      const res = await assistantHandler(req);
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }

    expect(lastStatus).toBe(429);
  });
});
