import { MapPin, Calendar } from 'lucide-react';
import { LocationSearch } from './location-search';
import { RefreshButton } from './refresh-button';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  city: string;
  stationName?: string;
  lastUpdated?: Date;
}

export function DashboardHeader({ city, stationName, lastUpdated }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Location Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {city}
          </h1>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
        
        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
          {stationName && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{stationName}</span>
            </div>
          )}
          
          {lastUpdated && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Action Controls */}
      <div className="flex items-center gap-2">
        <LocationSearch />
        <RefreshButton />
      </div>
    </div>
  );
}
