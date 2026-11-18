import { type NextRequest, NextResponse } from 'next/server';
import { LocationComparisonQuerySchema } from '@/features/air-quality/schemas';
import { airQualityService } from '@/server/services/air-quality.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const citiesParam = searchParams.get('cities');

    if (!citiesParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter "cities" is required (e.g. ?cities=Delhi,Mumbai,Bengaluru)',
          },
        },
        { status: 400 }
      );
    }

    const validated = LocationComparisonQuerySchema.safeParse({ cities: citiesParam });
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid comparison parameters. Provide 2 to 5 comma-separated cities.',
            details: validated.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const comparison = await airQualityService.compareLocations(validated.data.cities);

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
