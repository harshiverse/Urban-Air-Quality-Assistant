import type { Metadata } from 'next';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Historical Analysis',
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Analysis"
        description="Explore historical air quality trends, compare patterns, and analyse pollutant-specific data over time."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'History' },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Select disabled>
              <SelectTrigger className="w-32" aria-label="Select location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger className="w-32" aria-label="Select time range">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Chart Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hourly" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Hourly
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hourly AQI Trend</CardTitle>
              <CardDescription>
                Air quality index readings over the past 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  title="No hourly data available"
                  description="Hourly measurements will be displayed here once historical data is collected from monitoring stations."
                  icon={BarChart3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily AQI Trend</CardTitle>
              <CardDescription>
                Daily average AQI values over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  title="No daily data available"
                  description="Daily AQI averages will appear here once historical data ingestion begins. Charts will include proper axis labels, units, and missing-data indicators."
                  icon={BarChart3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly AQI Trend</CardTitle>
              <CardDescription>
                Weekly average AQI values showing longer-term patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  title="No weekly data available"
                  description="Weekly trends require at least 2 weeks of collected data to display meaningful patterns."
                  icon={TrendingUp}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pollutant-specific history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pollutant-Specific History</CardTitle>
          <CardDescription>
            Individual pollutant concentration trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No pollutant history available"
            description="Individual pollutant trends (PM2.5, PM10, NO₂, SO₂, CO, O₃) will be shown here with separate charts per pollutant, including averaging period context."
            icon={BarChart3}
          />
        </CardContent>
      </Card>
    </div>
  );
}
