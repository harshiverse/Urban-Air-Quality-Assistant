'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CarouselCardItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  category: string;
  badgeColor: string;
  bgGradient: string;
}

const DUMMY_CARDS: CarouselCardItem[] = [
  {
    id: '1',
    tag: 'ANAND VIHAR',
    title: '0316 AVE',
    subtitle: 'Delhi NCR',
    date: 'THU • NOV 2026',
    description: 'Real-time particulate tracking with automated laser scattering spectrometry.',
    category: 'High Density',
    badgeColor: 'border-amber-500/40 text-amber-500 bg-amber-500/10',
    bgGradient: 'from-amber-950/60 via-background to-card',
  },
  {
    id: '2',
    tag: 'BANDRA KURLA',
    title: 'MARINE 02',
    subtitle: 'Mumbai Coastal',
    date: 'WED • NOV 2026',
    description: 'Marine aerosol dispersion with coastal sea-breeze particulate scavenging.',
    category: 'Coastal Zone',
    badgeColor: 'border-sky-500/40 text-sky-500 bg-sky-500/10',
    bgGradient: 'from-sky-950/60 via-background to-card',
  },
  {
    id: '3',
    tag: 'BTM LAYOUT',
    title: 'SILICON CANOPY',
    subtitle: 'Bengaluru South',
    date: 'TUE • NOV 2026',
    description: 'Green corridor particulate sink buffering urban traffic corridors.',
    category: 'Clean Pocket',
    badgeColor: 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10',
    bgGradient: 'from-emerald-950/60 via-background to-card',
  },
  {
    id: '4',
    tag: 'VICTORIA MEMORIAL',
    title: 'RIVER BASIN',
    subtitle: 'Kolkata East',
    date: 'MON • NOV 2026',
    description: 'Early morning thermal inversion trapping particulate smoke along the Hooghly.',
    category: 'River Plain',
    badgeColor: 'border-purple-500/40 text-purple-500 bg-purple-500/10',
    bgGradient: 'from-purple-950/60 via-background to-card',
  },
  {
    id: '5',
    tag: 'VELACHERY',
    title: 'MONSOON FLUSH',
    subtitle: 'Chennai South',
    date: 'SUN • NOV 2026',
    description: 'Wet deposition scavenging atmospheric particulates following coastal showers.',
    category: 'Wet Scavenging',
    badgeColor: 'border-teal-500/40 text-teal-500 bg-teal-500/10',
    bgGradient: 'from-teal-950/60 via-background to-card',
  },
  {
    id: '6',
    tag: 'CHARMINAR',
    title: 'PLATEAU BREEZE',
    subtitle: 'Hyderabad Metro',
    date: 'SAT • NOV 2026',
    description: 'Deccan plateau elevation and wind dispersion reducing stagnation index.',
    category: 'Elevated Plain',
    badgeColor: 'border-indigo-500/40 text-indigo-500 bg-indigo-500/10',
    bgGradient: 'from-indigo-950/60 via-background to-card',
  },
  {
    id: '7',
    tag: 'GOMTI NAGAR',
    title: 'VALLEY TRAP',
    subtitle: 'Lucknow Central',
    date: 'FRI • NOV 2026',
    description: 'Low wind velocity causing seasonal stagnation of fine secondary particulates.',
    category: 'Valley Inversion',
    badgeColor: 'border-rose-500/40 text-rose-500 bg-rose-500/10',
    bgGradient: 'from-rose-950/60 via-background to-card',
  },
  {
    id: '8',
    tag: 'CPCB NATIONAL',
    title: '8-PARAM STANDARD',
    subtitle: 'Methodology Core',
    date: 'YEAR • 2026',
    description: 'Full linear piecewise interpolation covering PM2.5, PM10, NO2, SO2, CO, O3, NH3, Pb.',
    category: 'Regulatory',
    badgeColor: 'border-primary/40 text-primary bg-primary/10',
    bgGradient: 'from-primary/20 via-background to-card',
  },
  {
    id: '9',
    tag: 'WHO 2021',
    title: '15 µg/m³ TARGET',
    subtitle: 'Global Guideline',
    date: 'STANDARD • 2026',
    description: 'Stringent health reference limits benchmarking chronic cardiopulmonary risks.',
    category: 'Global Target',
    badgeColor: 'border-blue-500/40 text-blue-500 bg-blue-500/10',
    bgGradient: 'from-blue-950/60 via-background to-card',
  },
  {
    id: '10',
    tag: 'HEPA PURITY',
    title: 'MICRO PARTICLES',
    subtitle: 'Indoor Mitigation',
    date: 'PROTECT • 2026',
    description: 'Mechanical filtration removing 99.97% of airborne particulate matter down to 0.3 µm.',
    category: 'Protection',
    badgeColor: 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10',
    bgGradient: 'from-emerald-950/60 via-background to-card',
  },
];

export function RotatingCardsCarousel() {
  const cards = DUMMY_CARDS;
  const count = cards.length;
  const angleStep = 360 / count;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [radius, setRadius] = React.useState(380);

  // Responsive radius calculation
  React.useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setRadius(240);
      } else if (window.innerWidth < 1024) {
        setRadius(320);
      } else {
        setRadius(400);
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Smooth periodic auto-rotation to next card (every 3.2s)
  React.useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying, count]);

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = React.useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  // Keyboard navigation when hovering or focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const rotationAngle = -activeIndex * angleStep;

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-12 bg-background border-b border-border outline-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive 3D Perspective</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Environmental Chronicles & Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore rotating urban stations, meteorological episodes, and mitigation intelligence.
          </p>
        </div>

        {/* 3D Cylindrical Stage */}
        <div
          className="relative mx-auto flex items-center justify-center select-none"
          style={{
            height: '480px',
            perspective: '1200px',
          }}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Rotating Carousel Cylinder with smooth 700ms GPU easing */}
          <div
            className="relative w-[210px] sm:w-[230px] h-[280px] sm:h-[300px] transition-transform duration-700 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(-12deg) rotateY(${rotationAngle}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {cards.map((card, index) => {
              const cardAngle = index * angleStep;

              // Distance from activeIndex along the circle
              let diff = (index - activeIndex) % count;
              if (diff > count / 2) diff -= count;
              if (diff < -count / 2) diff += count;
              const absDiff = Math.abs(diff);

              const isFront = absDiff === 0;
              const isImmediate = absDiff === 1;
              const isBack = absDiff >= 3;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={cn(
                    'absolute inset-0 rounded-3xl border-2 p-5 flex flex-col justify-between cursor-pointer transition-all duration-500 backdrop-blur-md shadow-2xl',
                    isFront
                      ? 'border-primary/80 shadow-primary/25 opacity-100 scale-105 ring-2 ring-primary/40 z-30'
                      : isImmediate
                        ? 'border-border/70 opacity-80 scale-95 hover:opacity-95 z-20'
                        : isBack
                          ? 'border-border/20 opacity-35 grayscale-[35%] scale-85 shadow-none z-0'
                          : 'border-border/50 opacity-60 scale-90 z-10'
                  )}
                  style={{
                    transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                    background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)/0.85) 100%)`,
                    backfaceVisibility: 'visible',
                  }}
                >
                  {/* Card Top: Date & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      {card.date}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-widest',
                        card.badgeColor
                      )}
                    >
                      {card.category}
                    </span>
                  </div>

                  {/* Card Center: Visual & Title */}
                  <div className="space-y-1.5 my-auto">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-semibold tracking-wide">
                      <MapPin className="h-3 w-3" />
                      <span>{card.tag}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Card Bottom: Description & Status */}
                  <div className="border-t border-border/40 pt-2.5">
                    <p className="text-[11px] text-muted-foreground/90 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-9 w-9 active:scale-95 transition-transform"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="gap-2 rounded-full px-3.5 text-xs text-muted-foreground hover:text-foreground border border-border/50"
              aria-label={isPlaying ? 'Pause rotation' : 'Resume rotation'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-primary" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-primary" />
                  <span>Rotate</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-9 w-9 active:scale-95 transition-transform"
              aria-label="Next card"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Dots Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === activeIndex
                    ? 'w-6 bg-primary shadow-sm shadow-primary/30'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                )}
                aria-label={`Jump to card ${i + 1}: ${card.tag}`}
              />
            ))}
          </div>

          {/* Active Card Label */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {activeIndex + 1}
            </span>
            <span>/</span>
            <span>{count}</span>
            <span className="ml-1.5 text-[11px] font-medium text-primary">
              ({cards[activeIndex]?.tag})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
