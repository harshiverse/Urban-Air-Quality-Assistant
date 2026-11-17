import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value 0-100, or null for indeterminate */
  value?: number | null;
  /** Maximum value (default 100) */
  max?: number;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  success: 'bg-[hsl(var(--success))]',
  warning: 'bg-[hsl(var(--warning))]',
  destructive: 'bg-destructive',
};

/**
 * Progress bar component supporting determinate and indeterminate states.
 * Uses native `role="progressbar"` with proper ARIA attributes.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = 'default', ...props }, ref) => {
    const isIndeterminate = value === null || value === undefined;
    const percentage = isIndeterminate
      ? 0
      : Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          isIndeterminate
            ? 'Loading'
            : `${Math.round(percentage)}% complete`
        }
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantClasses[variant],
            isIndeterminate && 'w-1/3 animate-[indeterminate_1.5s_ease-in-out_infinite]'
          )}
          style={isIndeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
