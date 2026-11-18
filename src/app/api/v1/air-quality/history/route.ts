import { type NextRequest, NextResponse } from 'next/server';
import { HistoryQuerySchema } from '@/features/air-quality/schemas';
import { airQualityService } from '@/server/services/air-quality.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      city: searchParams.get('city') || undefined,
      stationCode: searchParams.get('stationCode') || undefined,
      range: searchParams.get('range') || undefined,
      pollutant: searchParams.get('pollutant') || undefined,
    };

    const validated = HistoryQuerySchema.safeParse(query);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid history query parameters',
            details: validated.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const history = await airQualityService.getHistoricalAirQuality({
      city: validated.data.city,
      stationCode: validated.data.stationCode,
      range: validated.data.range,
    });

    if (!history) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `No historical air quality records found for: ${validated.data.stationCode || validated.data.city || 'Delhi'}`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
