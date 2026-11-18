'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Layers,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AqiTrendChart } from '@/components/charts/aqi-trend-chart';
import { PollutantBreakdownChart } from '@/components/charts/pollutant-breakdown-chart';
import { ComparisonTrendChart, type ComparisonSeries } from '@/components/charts/comparison-trend-chart';
import { formatAqiValue, getAqiCategory } from '@/lib/formatters';
import type { HistoricalAirQualityDto, HistoryTimeRange } from '@/features/air-quality/types';
import { cn } from '@/lib/utils';

export interface HistoryViewProps {
  initialData: HistoricalAirQualityDto;
  comparisonData: HistoricalAirQualityDto[];
  cities: readonly string[];
  currentCity: string;
  currentRange: HistoryTimeRange;
}

const RANGE_OPTIONS: Array<{ value: HistoryTimeRange; label: string; description: string }> = [
  { value: '24h', label: '24 Hours', description: 'Hourly diurnal progression' },
  { value: '7d', label: '7 Days', description: 'Daily snapshots & weekly pattern' },
  { value: '30d', label: '30 Days', description: 'Rolling 30-day monthly trend' },
  { value: '90d', label: '90 Days', description: 'Seasonal quarterly environmental variations' },
];

const COMPARISON_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function HistoryView({
  initialData,
  comparisonData,
  cities,
  currentCity,
  currentRange,
}: HistoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const handleCityChange = (city: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('city', city);
    startTransition(() => {
      router.push(`/history?${params.toString()}`);
    });
  };

  const handleRangeChange = (range: HistoryTimeRange) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('range', range);
    startTransition(() => {
      router.push(`/history?${params.toString()}`);
    });
  };

  const summary = initialData.summary;
  const avgCategory = summary.avgAqi !== null ? getAqiCategory(summary.avgAqi) : null;
  const minCategory = summary.minAqi !== null ? getAqiCategory(summary.minAqi) : null;
  const maxCategory = summary.maxAqi !== null ? getAqiCategory(summary.maxAqi) : null;

  const [isCopied, setIsCopied] = React.useState(false);

  const handleShare = React.useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // Ignore clipboard write failures
    }
  }, []);

  const handleExportCsv = React.useCallback(() => {
    const headers = [
      'Timestamp_ISO',
      'Time_Label',
      'Location',
      'Station_Name',
      'Station_Code',
      'AQI',
      'Category',
      'Dominant_Pollutant',
      'PM2_5_ug_m3',
      'PM10_ug_m3',
      'NO2_ug_m3',
      'SO2_ug_m3',
      'CO_mg_m3',
      'O3_ug_m3',
      'NH3_ug_m3',
    ];

    const escapeCsv = (str: string | number | null | undefined) => {
      if (str === null || str === undefined) return '';
      const val = String(str);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = initialData.dataPoints.map((pt) => [
      escapeCsv(pt.timestamp),
      escapeCsv(pt.label),
      escapeCsv(initialData.location),
      escapeCsv(initialData.station.name),
      escapeCsv(initialData.station.stationCode),
      escapeCsv(pt.aqi),
      escapeCsv(pt.category),
      escapeCsv(pt.dominantPollutant),
      escapeCsv(pt.pm25),
      escapeCsv(pt.pm10),
      escapeCsv(pt.no2),
      escapeCsv(pt.so2),
      escapeCsv(pt.co),
      escapeCsv(pt.o3),
      escapeCsv(pt.nh3),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentCity.toLowerCase()}_aqi_history_${currentRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [initialData, currentCity, currentRange]);

  // Prepare comparison series
  const comparisonSeries: ComparisonSeries[] = React.useMemo(() => {
    const all = [initialData, ...comparisonData];
    return all.map((item, idx) => ({
      location: item.location,
      stationName: item.station.name,
      color: COMPARISON_COLORS[idx % COMPARISON_COLORS.length] || '#3b82f6',
      dataPoints: item.dataPoints,
    }));
  }, [initialData, comparisonData]);

  return (
    <div className={cn('space-y-6 transition-opacity duration-200', isPending && 'opacity-60 pointer-events-none')}>
      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Location:</span>
          </div>
          <Select value={currentCity} onValueChange={handleCityChange}>
            <SelectTrigger className="w-[170px] h-9 text-xs">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-xs">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground hidden md:inline">
            Station: <strong className="text-foreground">{initialData.station.name}</strong>
          </span>
        </div>

        {/* Right Action Controls: Range Selector + Export + Share + AI Shortcut */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {RANGE_OPTIONS.map((opt) => {
              const isActive = opt.value === currentRange;
              return (
                <Button
                  key={opt.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRangeChange(opt.value)}
                  className={cn('h-8 text-xs font-medium px-2.5', isActive ? 'shadow-sm' : 'border-border/60')}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-border/60 hidden sm:block" />

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 text-xs font-medium px-2.5 gap-1.5 border-border/60 hover:bg-muted/80"
            title="Export historical observations as RFC 4180 CSV"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>CSV</span>
          </Button>

          {/* Share Link Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 text-xs font-medium px-2.5 gap-1.5 border-border/60 hover:bg-muted/80"
            title="Share direct link to this historical view"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Share</span>
              </>
            )}
          </Button>

          {/* Ask AI Shortcut */}
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-medium px-2.5 gap-1.5 shadow-sm bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          >
            <Link
              href={`/assistant?city=${encodeURIComponent(currentCity)}&query=${encodeURIComponent(
                `Is the air quality in ${currentCity} improving or worsening over the last ${currentRange}?`
              )}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Average AQI */}
        <Card className="interactive-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Average AQI</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">
              {formatAqiValue(summary.avgAqi)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {avgCategory ? (
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                  style={{ backgroundColor: avgCategory.color }}
                >
                  {avgCategory.label}
                </span>
                <span className="text-[11px] text-muted-foreground">Period Mean</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Insufficient Data</span>
            )}
          </CardContent>
        </Card>

        {/* Min AQI */}
        <Card className="interactive-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Lowest AQI</span>
              <ArrowDown className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono text-emerald-500">
              {formatAqiValue(summary.minAqi)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {minCategory ? (
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                  style={{ backgroundColor: minCategory.color }}
                >
                  {minCategory.label}
                </span>
                <span className="text-[11px] text-muted-foreground">Best period quality</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unavailable</span>
            )}
          </CardContent>
        </Card>

        {/* Peak AQI */}
        <Card className="interactive-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Peak AQI</span>
              <ArrowUp className="h-4 w-4 text-rose-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono text-rose-500">
              {formatAqiValue(summary.maxAqi)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {maxCategory ? (
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                  style={{ backgroundColor: maxCategory.color }}
                >
                  {maxCategory.label}
                </span>
                <span className="text-[11px] text-muted-foreground">Max exposure spike</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unavailable</span>
            )}
          </CardContent>
        </Card>

        {/* Data Completeness */}
        <Card className="interactive-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Sensor Completeness</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">
              {summary.completenessPercentage.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>
                {summary.validPoints}/{summary.totalPoints} points (CPCB valid)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="aqi-trend" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="aqi-trend" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            AQI Trend
          </TabsTrigger>
          <TabsTrigger value="pollutants" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Pollutants
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Metro Comparison
          </TabsTrigger>
        </TabsList>

        {/* AQI Trend Tab */}
        <TabsContent value="aqi-trend" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{initialData.location} AQI Trend</span>
                    <Badge variant="outline" className="text-xs uppercase font-mono">
                      {currentRange}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Air Quality Index progression mapped across CPCB national breakpoint health zones.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Station: {initialData.station.stationCode}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AqiTrendChart data={initialData.dataPoints} height={360} showBands={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pollutants Breakdown Tab */}
        <TabsContent value="pollutants" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Pollutant Concentration Dynamics</CardTitle>
                  <CardDescription className="text-xs">
                    Continuous concentrations with CPCB National Ambient Air Quality Standards (NAAQS) safe limits.
                  </CardDescription>
                </div>
                {summary.dominantPollutant && (
                  <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                    Primary Driver: {summary.dominantPollutantName || summary.dominantPollutant}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PollutantBreakdownChart data={initialData.dataPoints} height={360} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Metro Comparative Trajectory</CardTitle>
                  <CardDescription className="text-xs">
                    Simultaneous side-by-side progression between {initialData.location} and other major Indian urban centers.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {comparisonSeries.length} Metros
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonTrendChart series={comparisonSeries} height={360} />

              {/* Metro Comparison Summary Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs text-left border border-border/60 rounded-lg overflow-hidden">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5">Location</th>
                      <th className="p-2.5">Station</th>
                      <th className="p-2.5 text-center">Avg AQI</th>
                      <th className="p-2.5 text-center">Lowest</th>
                      <th className="p-2.5 text-center">Peak</th>
                      <th className="p-2.5">Primary Pollutant</th>
                      <th className="p-2.5 text-right">Completeness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[initialData, ...comparisonData].map((cityItem) => {
                      const cityAvgCat = cityItem.summary.avgAqi !== null ? getAqiCategory(cityItem.summary.avgAqi) : null;
                      return (
                        <tr key={cityItem.location} className="hover:bg-muted/30">
                          <td className="p-2.5 font-semibold text-foreground flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{
                                backgroundColor:
                                  comparisonSeries.find((s) => s.location === cityItem.location)?.color || '#3b82f6',
                              }}
                            />
                            {cityItem.location}
                          </td>
                          <td className="p-2.5 text-muted-foreground">{cityItem.station.name}</td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            {formatAqiValue(cityItem.summary.avgAqi)}
                            {cityAvgCat && (
                              <span
                                className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold text-white"
                                style={{ backgroundColor: cityAvgCat.color }}
                              >
                                {cityAvgCat.label}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono text-emerald-500 font-medium">
                            {formatAqiValue(cityItem.summary.minAqi)}
                          </td>
                          <td className="p-2.5 text-center font-mono text-rose-500 font-medium">
                            {formatAqiValue(cityItem.summary.maxAqi)}
                          </td>
                          <td className="p-2.5 uppercase font-medium">
                            {cityItem.summary.dominantPollutant || 'N/A'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-muted-foreground">
                            {cityItem.summary.completenessPercentage.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attribution & Metadata Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground p-3 rounded-lg border border-border/40 bg-card/30">
        <span>Source: {initialData.sourceAttribution}</span>
        <span>Retrieved: {new Date(initialData.retrievedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
