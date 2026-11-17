'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SUPPORTED_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Lucknow',
  'Pune',
  'Ahmedabad',
];

export function LocationSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get('city') || 'Delhi';

  const handleCityChange = (city: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('city', city);
    params.delete('station'); // Clear station when city changes
    router.push(`/dashboard?${params.toString()}`);
  };

  const clearSelection = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('station');
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentCity} onValueChange={handleCityChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CITIES.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {searchParams.get('station') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="h-9 px-2"
          title="Clear station selection"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
