import * as React from 'react';
import Link from 'next/link';
import { Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSegmentedToggle } from '@/components/layout/theme-toggle';

export interface FooterProps {
  className?: string;
}

/**
 * Application footer with attribution, data source credits, and smooth theme segmented toggle.
 * Required by CPCB data usage — always displays data source attribution.
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t border-border bg-card px-4 py-4 transition-colors duration-200',
        className
      )}
      role="contentinfo"
    >
      <div className="flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        {/* Left: branding & attribution */}
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>
            © {currentYear} Urban Air Quality Assistant
          </span>
        </div>

        {/* Center: data sources */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium">Data sources:</span>
          <span>CPCB</span>
          <span aria-hidden="true">•</span>
          <span>data.gov.in</span>
          <span aria-hidden="true">•</span>
          <span>OpenAQ</span>
        </div>

        {/* Right: links and smooth segmented theme toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/methodology"
            className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            AQI Methodology
          </Link>
          <div className="h-3.5 w-px bg-border hidden sm:block" aria-hidden="true" />
          <ThemeSegmentedToggle />
        </div>
      </div>
    </footer>
  );
}
