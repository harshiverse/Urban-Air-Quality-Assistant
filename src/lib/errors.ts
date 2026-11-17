/**
 * Custom error classes for type-safe error handling
 */

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  CALCULATION_ERROR = 'CALCULATION',
  DATABASE_ERROR = 'DATABASE',
  INTERNAL_ERROR = 'INTERNAL',
}

export interface ErrorDetails {
  category: ErrorCategory;
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(errorDetails: ErrorDetails) {
    super(errorDetails.message);
    this.name = 'AppError';
    this.category = errorDetails.category;
    this.code = errorDetails.code;
    this.statusCode = errorDetails.statusCode;
    this.details = errorDetails.details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      category: ErrorCategory.VALIDATION,
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super({
      category: ErrorCategory.NOT_FOUND,
      message: `${resource} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super({
      category: ErrorCategory.RATE_LIMIT,
      message: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      details: retryAfter ? { retryAfter } : undefined,
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Provider error (external API failure)
 */
export class ProviderError extends AppError {
  constructor(provider: string, message?: string) {
    super({
      category: ErrorCategory.PROVIDER_ERROR,
      message: message || `External provider ${provider} is unavailable`,
      code: 'PROVIDER_ERROR',
      statusCode: 502,
      details: { provider },
    });
    this.name = 'ProviderError';
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message?: string) {
    super({
      category: ErrorCategory.DATABASE_ERROR,
      message: message || 'Database operation failed',
      code: 'DATABASE_ERROR',
      statusCode: 500,
    });
    this.name = 'DatabaseError';
  }
}

/**
 * Internal server error
 */
export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super({
      category: ErrorCategory.INTERNAL_ERROR,
      message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    });
    this.name = 'InternalError';
  }
}

/**
 * Check if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Format error for API response (sanitized, no stack traces)
 */
export function formatErrorResponse(error: unknown, requestId?: string) {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        category: error.category,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        requestId,
        details: error.details,
      },
    };
  }

  // Unknown error - return generic message
  return {
    success: false,
    error: {
      category: ErrorCategory.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}
