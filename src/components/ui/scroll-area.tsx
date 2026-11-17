import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the scroll area */
  orientation?: 'vertical' | 'horizontal' | 'both';
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'vertical', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full',
            orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
            orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
            orientation === 'both' && 'overflow-auto',
            // Thin scrollbar styling
            '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2',
            '[&::-webkit-scrollbar-track]:bg-transparent',
            '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
            '[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50',
            'scrollbar-thin'
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
