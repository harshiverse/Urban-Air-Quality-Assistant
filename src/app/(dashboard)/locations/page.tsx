import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { airQualityService } from '@/server/services/air-quality.service';
import { LocationsView } from '@/components/locations/locations-view';

export const metadata: Metadata = {
  title: 'Location Intelligence & Station Directory - CPCB Air Quality',
  description:
    'Browse monitoring stations across India, locate nearest stations with geodesic proximity, and compare urban air quality side by side.',
};

export default async function LocationsPage() {
  // Fetch initial list of all monitoring stations
  const stations = await airQualityService.searchLocations();

  // Initial comparison for top 3 metros
  const comparison = await airQualityService.compareLocations(['Delhi', 'Mumbai', 'Bengaluru']);

  // Aggregate featured cities dynamically from stations list
  const cityMap = new Map<string, { name: string; state: string; stationCount: number }>();
  stations.forEach((st) => {
    const existing = cityMap.get(st.city);
    if (existing) {
      existing.stationCount += 1;
    } else {
      cityMap.set(st.city, {
        name: st.city,
        state: st.state,
        stationCount: 1,
      });
    }
  });

  const featuredCities = Array.from(cityMap.values()).sort((a, b) => b.stationCount - a.stationCount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Location Intelligence"
        description="Discover nearby monitoring stations, inspect sensor metadata, and benchmark urban air quality across India."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Locations' },
            ]}
          />
        }
      />

      <LocationsView
        initialStations={stations}
        initialComparison={comparison}
        featuredCities={featuredCities}
      />
    </div>
  );
}
