import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton loading state for the main AQI display card.
 * Mirrors the layout of the actual AQI overview component.
 */
export function AqiOverviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AQI number */}
        <div className="flex flex-col items-center gap-2 py-4">
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Scale bar */}
        <Skeleton className="h-6 w-full rounded-md" />
        <Skeleton className="h-3 w-full" />

        {/* Attribution */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loading state for a pollutant card.
 */
export function PollutantCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for the pollutant grid (typically 6-8 cards).
 */
export function PollutantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <PollutantCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Complete dashboard skeleton combining all components.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 page-enter">
      {/* Page header skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Top grid: AQI overview + quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AqiOverviewSkeleton />

        {/* Quick stats cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pollutant grid */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <PollutantGridSkeleton />
      </div>
    </div>
  );
}
