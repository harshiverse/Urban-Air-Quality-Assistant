'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface CityTabsProps {
  cities: readonly string[];
  selectedCity: string;
  className?: string;
}

/**
 * Smooth segmented control for switching cities.
 * Provides a tactile sliding pill effect with instant client-side responsiveness.
 */
export function CityTabs({ cities, selectedCity, className }: CityTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const handleCityChange = (city: string) => {
    if (city.toLowerCase() === selectedCity.toLowerCase()) return;
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('city', city);
    params.delete('station'); // reset station on city switch
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Monitored cities"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-muted/80 p-1 border border-border/50 text-muted-foreground overflow-x-auto max-w-full scrollbar-none',
        isPending && 'opacity-70 pointer-events-none',
        className
      )}
    >
      {cities.map((city) => {
        const isActive = city.toLowerCase() === selectedCity.toLowerCase();
        return (
          <button
            key={city}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleCityChange(city)}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
            )}
          >
            {city}
          </button>
        );
      })}
    </div>
  );
}
