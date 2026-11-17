import type { Metadata } from 'next';
import { Search, MapPin, Navigation } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Locations',
};

/**
 * Major Indian cities with monitoring stations — static fixture for Phase 3.
 * Real data will come from the data provider in Phase 6.
 */
const FEATURED_CITIES = [
  { name: 'Delhi', state: 'Delhi', stations: 40 },
  { name: 'Mumbai', state: 'Maharashtra', stations: 26 },
  { name: 'Bengaluru', state: 'Karnataka', stations: 14 },
  { name: 'Chennai', state: 'Tamil Nadu', stations: 11 },
  { name: 'Kolkata', state: 'West Bengal', stations: 12 },
  { name: 'Hyderabad', state: 'Telangana', stations: 8 },
  { name: 'Pune', state: 'Maharashtra', stations: 9 },
  { name: 'Ahmedabad', state: 'Gujarat', stations: 6 },
  { name: 'Lucknow', state: 'Uttar Pradesh', stations: 7 },
  { name: 'Jaipur', state: 'Rajasthan', stations: 5 },
  { name: 'Chandigarh', state: 'Chandigarh', stations: 3 },
  { name: 'Patna', state: 'Bihar', stations: 4 },
] as const;

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Browse monitoring stations, compare air quality across cities, and discover local conditions."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'Locations' },
            ]}
          />
        }
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Navigation className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Use my location</span>
          </Button>
        }
      />

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search for a city, locality, or monitoring station…"
              className="pl-10"
              aria-label="Search locations"
              disabled
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Location search will be enabled when the data provider is connected (Phase 6).
          </p>
        </CardContent>
      </Card>

      {/* Featured Cities */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Featured Cities
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURED_CITIES.map((city) => (
            <Card
              key={city.name}
              className="transition-colors hover:border-primary/30 cursor-default"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {city.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {city.stations} stations
                  </Badge>
                </div>
                <CardDescription>{city.state}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>AQI data unavailable — connect provider</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location Comparison</CardTitle>
          <CardDescription>
            Compare air quality between different locations side by side
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Comparison not available"
            description="Select locations to compare once real-time data is connected. This feature requires at least two locations with active monitoring."
            icon={MapPin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
