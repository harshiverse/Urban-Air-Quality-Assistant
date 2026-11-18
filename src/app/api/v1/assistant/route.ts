import { type NextRequest, NextResponse } from 'next/server';
import { AiAssistantRequestSchema } from '@/features/assistant/schemas';
import { aiAssistantService } from '@/server/services/ai-assistant.service';
import { formatErrorResponse } from '@/lib/errors';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce IP-based rate limiting (20 requests per minute per IP)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0]!.trim() : '127.0.0.1';

    const rateLimit = checkRateLimit(clientIp, 20, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Please wait ${rateLimit.resetSeconds} seconds before sending another question.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetSeconds.toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Parse and validate request JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid JSON request payload',
          },
        },
        { status: 400 }
      );
    }

    const validated = AiAssistantRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid assistant query parameters',
            details: validated.error.format(),
          },
        },
        { status: 400 }
      );
    }

    // 3. Process question through grounded AI service
    const response = await aiAssistantService.answerUserQuery(validated.data);

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
