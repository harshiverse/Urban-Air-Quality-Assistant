'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { CitySelectorMenu } from '@/components/layout/city-selector-menu';

interface HeaderProps {
  readonly onMenuToggle?: () => void;
}

/**
 * Application header with mobile menu toggle, interactive city switcher, and 1-click smooth theme toggle.
 */
export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 transition-colors duration-200"
      role="banner"
    >
      {/* Mobile menu toggle */}
      {onMenuToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden transition-transform active:scale-95"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      )}

      {/* Page title area */}
      <div className="flex-1 min-w-0" />

      {/* Right side controls: Smooth City Switcher and 1-Click Smooth Theme Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <CitySelectorMenu />
        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" aria-hidden="true" />
        <ThemeToggle />
      </div>
    </header>
  );
}
