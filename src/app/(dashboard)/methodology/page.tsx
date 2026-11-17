import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AQI_CATEGORIES, POLLUTANT_NAMES, POLLUTANT_UNITS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'AQI Methodology',
};

/**
 * CPCB breakpoint table data for display.
 * These are the official breakpoints used in the AQI calculation engine.
 */
const BREAKPOINT_TABLE = [
  {
    category: 'Good',
    range: '0–50',
    pm25: '0–30',
    pm10: '0–50',
    no2: '0–40',
    so2: '0–40',
    co: '0–1.0',
    o3: '0–50',
    nh3: '0–200',
    pb: '0–0.5',
  },
  {
    category: 'Satisfactory',
    range: '51–100',
    pm25: '31–60',
    pm10: '51–100',
    no2: '41–80',
    so2: '41–80',
    co: '1.1–2.0',
    o3: '51–100',
    nh3: '201–400',
    pb: '0.5–1.0',
  },
  {
    category: 'Moderately Polluted',
    range: '101–200',
    pm25: '61–90',
    pm10: '101–250',
    no2: '81–180',
    so2: '81–380',
    co: '2.1–10',
    o3: '101–168',
    nh3: '401–800',
    pb: '1.1–2.0',
  },
  {
    category: 'Poor',
    range: '201–300',
    pm25: '91–120',
    pm10: '251–350',
    no2: '181–280',
    so2: '381–800',
    co: '10–17',
    o3: '169–208',
    nh3: '801–1200',
    pb: '2.1–3.0',
  },
  {
    category: 'Very Poor',
    range: '301–400',
    pm25: '121–250',
    pm10: '351–430',
    no2: '281–400',
    so2: '801–1600',
    co: '17–34',
    o3: '209–748*',
    nh3: '1201–1800',
    pb: '3.1–3.5',
  },
  {
    category: 'Severe',
    range: '401–500',
    pm25: '250+',
    pm10: '430+',
    no2: '400+',
    so2: '1600+',
    co: '34+',
    o3: '748+*',
    nh3: '1800+',
    pb: '3.5+',
  },
] as const;

export default function MethodologyPage() {
  const categoryEntries = Object.entries(AQI_CATEGORIES) as [
    string,
    { min: number; max: number; label: string; color: string },
  ][];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AQI Methodology"
        description="Learn about the CPCB National Air Quality Index methodology used for all AQI calculations in this application."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'Methodology' },
            ]}
          />
        }
      />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            CPCB National Air Quality Index
          </CardTitle>
          <CardDescription>
            India&apos;s official AQI methodology by the Central Pollution Control
            Board
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-3">
          <p className="text-sm text-muted-foreground">
            The National Air Quality Index (AQI) was launched in India in 2014 by
            the Central Pollution Control Board (CPCB). It transforms complex
            pollutant measurements into a single number (0–500) that communicates
            air quality health risks.
          </p>
          <p className="text-sm text-muted-foreground">
            The AQI is calculated from individual pollutant sub-indices. Each
            pollutant has specific breakpoint concentrations that map to AQI
            ranges. The <strong>overall AQI</strong> is determined by the{' '}
            <strong>highest valid sub-index</strong> among all measured pollutants
            — it is not an average.
          </p>
        </CardContent>
      </Card>

      {/* AQI Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AQI Categories</CardTitle>
          <CardDescription>
            Six categories from Good (0–50) to Severe (401–500)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categoryEntries.map(([key, cat]) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <div
                  className="h-8 w-8 rounded-md shrink-0"
                  style={{ backgroundColor: cat.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">
                    AQI {cat.min}–{cat.max}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pollutants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitored Pollutants</CardTitle>
          <CardDescription>
            Eight pollutants measured under the CPCB AQI framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              Object.entries(POLLUTANT_NAMES) as [
                keyof typeof POLLUTANT_NAMES,
                string,
              ][]
            ).map(([key, name]) => (
              <div
                key={key}
                className="rounded-md border border-border p-3 space-y-1"
              >
                <p className="text-sm font-medium">{name}</p>
                <Badge variant="secondary" className="text-xs">
                  {POLLUTANT_UNITS[key]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakpoint Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pollutant Breakpoint Table
          </CardTitle>
          <CardDescription>
            Concentration ranges (units vary by pollutant) mapping to each AQI
            category. PM2.5 and PM10 in µg/m³, CO in mg/m³.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    AQI
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    PM2.5
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    PM10
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    NO₂
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    SO₂
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    CO
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    O₃
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    NH₃
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Pb
                  </th>
                </tr>
              </thead>
              <tbody>
                {BREAKPOINT_TABLE.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2 font-medium">{row.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.range}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.pm25}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.pm10}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.no2}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.so2}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.co}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.o3}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.nh3}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.pb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * O₃ breakpoints above 200 AQI use 1-hour averaging period instead of 8-hour.
            All other pollutants use 24-hour averaging for PM, NO₂, SO₂, NH₃, Pb and
            8-hour for CO, O₃ (up to 200 AQI).
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Calculation Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calculation Steps</CardTitle>
          <CardDescription>
            How the AQI is computed from raw pollutant measurements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong className="text-foreground">Collect measurements</strong>{' '}
              — Obtain concentration values for each pollutant from the
              monitoring station with appropriate averaging periods.
            </li>
            <li>
              <strong className="text-foreground">
                Validate data sufficiency
              </strong>{' '}
              — Verify minimum data availability requirements are met. At least
              3 pollutants must have valid measurements, with PM2.5 or PM10
              being mandatory.
            </li>
            <li>
              <strong className="text-foreground">
                Calculate sub-indices
              </strong>{' '}
              — For each pollutant with valid data, interpolate the concentration
              within the breakpoint table using the formula:
              <br />
              <code className="mt-1 inline-block rounded bg-muted px-2 py-1 text-xs font-mono">
                I = ((I_high - I_low) / (C_high - C_low)) × (C - C_low) + I_low
              </code>
            </li>
            <li>
              <strong className="text-foreground">Determine overall AQI</strong>{' '}
              — The AQI is the <em>maximum</em> of all valid sub-indices. It is
              not an average.
            </li>
            <li>
              <strong className="text-foreground">
                Identify dominant pollutant
              </strong>{' '}
              — The pollutant with the highest sub-index is the dominant
              pollutant.
            </li>
            <li>
              <strong className="text-foreground">Map to category</strong> — Map
              the final AQI value to one of six categories (Good to Severe).
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limitations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              AQI represents air quality at the monitoring station, not
              necessarily at the user&apos;s exact location.
            </li>
            <li>
              Some stations may not measure all pollutants — the AQI is
              calculated from available data only.
            </li>
            <li>
              AQI values above 500 are beyond the CPCB scale and should be
              interpreted with caution.
            </li>
            <li>
              The methodology does not account for synergistic effects of
              multiple pollutants.
            </li>
            <li>
              Real-time values may differ from the prescribed averaging periods
              and should be considered indicative.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
