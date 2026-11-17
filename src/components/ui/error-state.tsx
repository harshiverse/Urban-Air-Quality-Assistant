'use client';

import * as React from 'react';
import {
  AlertTriangle,
  WifiOff,
  ServerOff,
  ShieldAlert,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ErrorVariant =
  | 'generic'
  | 'network'
  | 'provider'
  | 'permission'
  | 'notFound';

export interface ErrorStateProps {
  /** Error variant determines icon and default message */
  variant?: ErrorVariant;
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Retry handler; if provided, a retry button is shown */
  onRetry?: () => void;
  /** Whether the retry is currently in progress */
  isRetrying?: boolean;
  /** Optional custom icon */
  icon?: LucideIcon;
  /** Additional content (e.g. error details expandable) */
  children?: React.ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  ErrorVariant,
  { icon: LucideIcon; title: string; description: string }
> = {
  generic: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    description:
      'An unexpected error occurred. Please try again or contact support if the problem persists.',
  },
  network: {
    icon: WifiOff,
    title: 'Connection error',
    description:
      'Unable to connect to the server. Please check your internet connection and try again.',
  },
  provider: {
    icon: ServerOff,
    title: 'Data provider unavailable',
    description:
      'The air quality data provider is currently unavailable. Cached data may still be shown.',
  },
  permission: {
    icon: ShieldAlert,
    title: 'Permission denied',
    description:
      'You do not have permission to access this resource.',
  },
  notFound: {
    icon: AlertTriangle,
    title: 'Not found',
    description: 'The requested resource could not be found.',
  },
};

/**
 * Reusable error state component for data-loading scenarios.
 * Provides variant-based styling with optional retry functionality.
 */
export function ErrorState({
  variant = 'generic',
  title,
  description,
  onRetry,
  isRetrying = false,
  icon,
  children,
  className,
}: ErrorStateProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = icon ?? config.icon;
  const displayTitle = title ?? config.title;
  const displayDescription = description ?? config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <Icon
          className="h-6 w-6 text-destructive"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{displayDescription}</p>
      </div>

      {children}

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="gap-2"
        >
          <RefreshCw
            className={cn('h-4 w-4', isRetrying && 'animate-spin')}
            aria-hidden="true"
          />
          {isRetrying ? 'Retrying…' : 'Try again'}
        </Button>
      )}
    </div>
  );
}
