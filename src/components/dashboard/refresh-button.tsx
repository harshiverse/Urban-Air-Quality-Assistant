'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function RefreshButton({ className, showLabel = false }: RefreshButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefreshTime, setLastRefreshTime] = React.useState<Date | null>(null);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    
    // Trigger Next.js router refresh to re-fetch server component data
    router.refresh();
    
    setLastRefreshTime(new Date());
    
    // Reset spinning animation after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [router]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size={showLabel ? 'default' : 'icon'}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={cn('relative', className)}
        title="Refresh data"
      >
        <RefreshCw
          className={cn(
            'h-4 w-4',
            isRefreshing && 'animate-spin',
            showLabel && 'mr-2'
          )}
        />
        {showLabel && <span>Refresh</span>}
      </Button>
      
      {lastRefreshTime && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Updated {lastRefreshTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
