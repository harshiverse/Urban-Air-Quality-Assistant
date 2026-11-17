import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // AQI category variants using CPCB standard colors from tailwind config
        good: 'border-transparent bg-aqi-good text-aqi-good-foreground',
        satisfactory:
          'border-transparent bg-aqi-satisfactory text-aqi-satisfactory-foreground',
        moderate:
          'border-transparent bg-aqi-moderate text-aqi-moderate-foreground',
        poor: 'border-transparent bg-aqi-poor text-aqi-poor-foreground',
        veryPoor:
          'border-transparent bg-aqi-veryPoor text-aqi-veryPoor-foreground',
        severe:
          'border-transparent bg-aqi-severe text-aqi-severe-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
