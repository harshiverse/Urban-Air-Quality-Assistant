import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * CSS-based tooltip component (no @radix-ui/react-tooltip dependency).
 * Uses a data-attribute and CSS for positioning and visibility.
 */

export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Default delay in ms before showing tooltip */
  delayDuration?: number;
}

/** Provider is a passthrough — included for API compatibility */
function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}
TooltipProvider.displayName = 'TooltipProvider';

export interface TooltipProps {
  children: React.ReactNode;
}

/** Wrapper — included for API compatibility */
function Tooltip({ children }: TooltipProps) {
  return <>{children}</>;
}
Tooltip.displayName = 'Tooltip';

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn('group/tooltip relative inline-flex', className)}
    {...props}
  />
));
TooltipTrigger.displayName = 'TooltipTrigger';

export interface TooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = 'top', children, ...props }, ref) => {
    const positionClasses: Record<string, string> = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md group-hover/tooltip:block group-focus-visible/tooltip:block',
          positionClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
