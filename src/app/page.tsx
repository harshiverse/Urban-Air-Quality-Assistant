import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wind,
  ShieldCheck,
  Activity,
  Cpu,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle, ThemeSegmentedToggle } from '@/components/layout/theme-toggle';
import { AQI_CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Urban Air Quality Assistant — Environmental Intelligence for India',
  description:
    'Real-time CPCB air quality monitoring, evidence-based health guidance, and AI-powered environmental insights for Indian cities.',
};

const CPCB_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  GOOD: 'Minimal health impact; air quality is clean and poses little to no risk.',
  SATISFACTORY: 'May cause minor breathing discomfort to sensitive individuals on prolonged exposure.',
  MODERATELY_POLLUTED: 'Breathing discomfort to people with lung disease, asthma, children, and older adults.',
  POOR: 'Breathing discomfort to most people on prolonged exposure; high risk for sensitive groups.',
  VERY_POOR: 'May cause respiratory illness on prolonged exposure; pronounced symptoms in cardiac and lung patients.',
  SEVERE: 'Affects healthy people and severely impacts individuals with existing respiratory illnesses.',
};

const FEATURED_METROS = [
  { city: 'Delhi', state: 'Delhi NCR', sampleAqi: 284, category: 'POOR', dominant: 'PM2.5' },
  { city: 'Mumbai', state: 'Maharashtra', sampleAqi: 118, category: 'MODERATELY_POLLUTED', dominant: 'PM10' },
  { city: 'Bengaluru', state: 'Karnataka', sampleAqi: 48, category: 'GOOD', dominant: 'PM2.5' },
  { city: 'Kolkata', state: 'West Bengal', sampleAqi: 182, category: 'MODERATELY_POLLUTED', dominant: 'PM2.5' },
  { city: 'Chennai', state: 'Tamil Nadu', sampleAqi: 74, category: 'SATISFACTORY', dominant: 'PM10' },
  { city: 'Hyderabad', state: 'Telangana', sampleAqi: 92, category: 'SATISFACTORY', dominant: 'PM2.5' },
  { city: 'Lucknow', state: 'Uttar Pradesh', sampleAqi: 245, category: 'POOR', dominant: 'PM2.5' },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Wind className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-foreground block">
              AirQ Assistant
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block">
              CPCB Environmental Intelligence
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/locations" className="hover:text-foreground transition-colors">
            Locations
          </Link>
          <Link href="/history" className="hover:text-foreground transition-colors">
            History
          </Link>
          <Link href="/assistant" className="hover:text-foreground transition-colors">
            AI Assistant
          </Link>
          <Link href="/methodology" className="hover:text-foreground transition-colors">
            Methodology
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex gap-1.5 shadow-sm">
            <Link href="/dashboard">
              <span>Launch App</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 px-6 lg:px-12 border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="mx-auto max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official CPCB National Air Quality Index Standard</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Understand the Air You Breathe.{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Make Informed Decisions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforming complex environmental measurements into accessible, evidence-based intelligence
              for citizens, outdoor workers, and healthcare-sensitive individuals across India.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="gap-2 shadow-md text-base px-6">
                <Link href="/dashboard">
                  <Activity className="h-5 w-5" />
                  <span>Explore Live Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-6">
                <Link href="/methodology">
                  <span>How AQI is Calculated</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Metros Live Preview Grid */}
        <section className="py-12 px-6 lg:px-12 max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Monitored Metros Overview
              </h2>
              <p className="text-sm text-muted-foreground">
                Real-time snapshot across major Indian urban centers.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all stations in Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_METROS.map((metro) => {
              const categoryData = AQI_CATEGORIES[metro.category as keyof typeof AQI_CATEGORIES];
              return (
                <Link
                  key={metro.city}
                  href={`/dashboard?city=${encodeURIComponent(metro.city)}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/50 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                          {metro.city}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: categoryData?.color,
                            color: categoryData?.color,
                          }}
                          className="text-[10px] font-semibold"
                        >
                          {categoryData?.label}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>{metro.state}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline justify-between pt-2">
                        <div>
                          <span className="text-3xl font-extrabold tabular-nums">
                            {metro.sampleAqi}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">AQI</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Dominant: <strong>{metro.dominant}</strong>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Core Capabilities Section */}
        <section className="py-16 px-6 lg:px-12 bg-muted/30 border-y border-border">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Built with Engineering Rigor
              </h2>
              <p className="text-sm text-muted-foreground">
                Addressing three critical environmental questions: What is happening? Why is it happening? What practical actions can you take?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Deterministic CPCB Engine</CardTitle>
                  <CardDescription className="text-xs">
                    Linear piecewise interpolation strictly adhering to National AQI breakpoints across 8 criteria pollutants.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>3-pollutant data sufficiency validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Mandatory particle pollutant rule (PM2.5/PM10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Dominant pollutant priority tie-breaking</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Targeted Health Guidance</CardTitle>
                  <CardDescription className="text-xs">
                    Non-medical evidence-based precautions customized for varied citizen demographics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>General citizens & working professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Children, elderly & sensitive individuals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Outdoor laborers, runners & cyclists</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Environmental AI</CardTitle>
                  <CardDescription className="text-xs">
                    Provider-independent AI integration layer grounded in verified environmental data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Multi-provider fallback (data.gov.in & OpenAQ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Grounding-first assistant prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Graceful fallback when AI is unavailable</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CPCB Scale Reference Table */}
        <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Official CPCB Air Quality Index Scale
            </h2>
            <p className="text-sm text-muted-foreground">
              Six standard categories designated by the Central Pollution Control Board (Ministry of Environment, Forest and Climate Change).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(AQI_CATEGORIES).map(([key, category]) => {
              const description = CPCB_CATEGORY_DESCRIPTIONS[key] ?? 'Standard environmental category.';
              return (
                <div
                  key={key}
                  className="rounded-lg border p-4 space-y-2 transition-all duration-200 hover:shadow-sm"
                  style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: category.color }}>
                      {category.label}
                    </span>
                    <Badge variant="outline" className="text-xs tabular-nums">
                      {category.min} – {category.max}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 lg:px-12 py-6 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            <span>Urban Air Quality Assistant • Built for India</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/methodology" className="hover:text-foreground transition-colors">
              Methodology
            </Link>
            <div className="h-3 w-px bg-border" />
            <ThemeSegmentedToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
