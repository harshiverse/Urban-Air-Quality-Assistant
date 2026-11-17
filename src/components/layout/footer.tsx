import * as React from 'react';
import Link from 'next/link';
import { Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSegmentedToggle } from '@/components/layout/theme-toggle';

export interface FooterProps {
  className?: string;
}

/**
 * Homepage and Application Footer matching reference layout with 4 link columns
 * and a large "AIRQ" watermark spanning the bottom width.
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'relative overflow-hidden border-t border-border bg-card/60 backdrop-blur-sm text-foreground transition-colors duration-200',
        className
      )}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-0">
        {/* Upper Navigation & Branding Row */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
          {/* Brand & Copyright */}
          <div className="space-y-3 max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Wind className="h-4 w-4" />
              </span>
              <span>AIRQ</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              © copyright AIRQ {currentYear}. All rights reserved.
            </p>
            <div className="pt-2">
              <ThemeSegmentedToggle />
            </div>
          </div>

          {/* Links Grid: 4 Columns matching reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 text-xs">
            {/* Column 1: Pages */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm tracking-tight">Pages</h4>
              <ul className="space-y-2.5 text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Live Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="hover:text-primary transition-colors">
                    City Search
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="hover:text-primary transition-colors">
                    Historical Trends
                  </Link>
                </li>
                <li>
                  <Link href="/assistant" className="hover:text-primary transition-colors">
                    AI Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="hover:text-primary transition-colors">
                    Methodology
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Socials */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm tracking-tight">Socials</h4>
              <ul className="space-y-2.5 text-muted-foreground">
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-primary transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-primary transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-primary transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-primary transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm tracking-tight">Legal</h4>
              <ul className="space-y-2.5 text-muted-foreground">
                <li>
                  <Link href="/methodology" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="hover:text-primary transition-colors">
                    Data Transparency
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Register */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm tracking-tight">Register</h4>
              <ul className="space-y-2.5 text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Forgot Password
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Station Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant Watermark Typography matching DevStudio reference */}
        <div className="w-full overflow-hidden flex justify-center items-end pt-12 sm:pt-20 select-none pointer-events-none">
          <span className="text-[19vw] font-black tracking-tighter leading-[0.78] text-foreground/[0.06] dark:text-foreground/[0.04] uppercase">
            AIRQ
          </span>
        </div>
      </div>
    </footer>
  );
}
