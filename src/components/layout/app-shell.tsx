'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { Header } from './header';
import { Footer } from './footer';

interface AppShellProps {
  readonly children: React.ReactNode;
}

/**
 * Application shell providing the complete layout structure:
 * - Skip-to-content link (accessibility)
 * - Desktop sidebar navigation
 * - Sticky header with controls
 * - Main content area
 * - Footer with attribution
 * - Mobile bottom navigation
 */
export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          {/* Slide-in sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
            <Sidebar
              collapsed={false}
              onToggle={closeMobileNav}
              isMobileOverlay
            />
          </div>
        </>
      )}

      {/* Main area: header + content + footer */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuToggle={toggleMobileNav} />

        <main
          id="main-content"
          className={cn(
            'flex-1 overflow-y-auto p-4 md:p-6',
            // Leave room for mobile bottom nav
            'pb-20 md:pb-6'
          )}
          tabIndex={-1}
        >
          <div className="page-enter">{children}</div>
        </main>

        {/* Footer — hidden on mobile to avoid overlap with bottom nav */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
