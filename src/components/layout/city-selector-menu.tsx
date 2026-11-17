'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const CITIES = [
  { name: 'Delhi', state: 'Delhi NCR', region: 'North' },
  { name: 'Mumbai', state: 'Maharashtra', region: 'West' },
  { name: 'Bengaluru', state: 'Karnataka', region: 'South' },
  { name: 'Kolkata', state: 'West Bengal', region: 'East' },
  { name: 'Chennai', state: 'Tamil Nadu', region: 'South' },
  { name: 'Hyderabad', state: 'Telangana', region: 'South' },
  { name: 'Lucknow', state: 'Uttar Pradesh', region: 'North' },
] as const;

export function CitySelectorMenu({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCity = searchParams?.get('city') || 'Delhi';
  const matchedCity = CITIES.find((c) => c.name.toLowerCase() === rawCity.toLowerCase()) ?? CITIES[0];
  const activeCityName = matchedCity?.name ?? 'Delhi';

  const handleSelectCity = (cityName: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('city', cityName);
    params.delete('station'); // reset station when switching city
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'group gap-1.5 transition-all duration-200 hover:border-primary/50 active:scale-95',
            className
          )}
          aria-label={`Select city. Current city: ${activeCityName}`}
        >
          <MapPin className="h-4 w-4 text-primary shrink-0 animate-pulse" aria-hidden="true" />
          <span className="font-semibold text-xs sm:text-sm">{activeCityName}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border/80">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          Select Monitored Metro
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuRadioGroup value={activeCityName} onValueChange={handleSelectCity}>
          {CITIES.map((c) => (
            <DropdownMenuRadioItem
              key={c.name}
              value={c.name}
              className="py-2 pl-9 pr-3 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight text-foreground">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">{c.state}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
