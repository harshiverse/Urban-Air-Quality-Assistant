import { type NextRequest, NextResponse } from 'next/server';
import { LocationSearchQuerySchema } from '@/features/air-quality/schemas';
import { airQualityService } from '@/server/services/air-quality.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validated = LocationSearchQuerySchema.safeParse(query);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validated.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const stations = await airQualityService.searchLocations(validated.data.q);
    const limited = stations.slice(0, validated.data.limit);

    return NextResponse.json({
      success: true,
      data: {
        total: stations.length,
        results: limited,
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
