import { type NextRequest, NextResponse } from 'next/server';
import { CurrentAqiQuerySchema } from '@/features/air-quality/schemas';
import { airQualityService } from '@/server/services/air-quality.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      city: searchParams.get('city') || undefined,
      stationCode: searchParams.get('stationCode') || undefined,
    };

    const validated = CurrentAqiQuerySchema.safeParse(query);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validated.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const snapshot = await airQualityService.getCurrentAirQuality(validated.data);

    if (!snapshot) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `No air quality data available for location: ${validated.data.stationCode || validated.data.city || 'Delhi'}`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
