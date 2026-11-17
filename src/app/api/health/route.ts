import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Returns application health status
 */
export async function GET() {
  try {
    // In the future, add checks for:
    // - Database connection
    // - External provider availability
    // - AI provider availability
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        application: 'healthy',
        // database: 'healthy',
        // providers: 'healthy',
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
