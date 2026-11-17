'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  MessageSquare,
  BookOpen,
  Wind,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly description: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Air quality overview',
  },
  {
    label: 'Locations',
    href: '/locations',
    icon: MapPin,
    description: 'Browse monitoring stations',
  },
  {
    label: 'History',
    href: '/history',
    icon: BarChart3,
    description: 'Historical trends',
  },
  {
    label: 'AI Assistant',
    href: '/assistant',
    icon: MessageSquare,
    description: 'Ask about air quality',
  },
  {
    label: 'Methodology',
    href: '/methodology',
    icon: BookOpen,
    description: 'AQI calculation details',
  },
] as const;

interface SidebarProps {
  readonly collapsed: boolean;
  readonly onToggle: () => void;
  /** When true, renders as a mobile overlay (always expanded, with close button) */
  readonly isMobileOverlay?: boolean;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

/**
 * Desktop sidebar navigation with collapsible state.
 * Also used as a mobile overlay when isMobileOverlay is true.
 */
export function Sidebar({
  collapsed,
  onToggle,
  isMobileOverlay = false,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'flex flex-col h-full border-r border-border bg-card transition-[width] duration-200 ease-in-out',
        isMobileOverlay
          ? 'w-64'
          : cn('hidden md:flex', collapsed ? 'w-16' : 'w-64')
      )}
    >
      {/* Branding */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
        <Wind className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
        {(!collapsed || isMobileOverlay) && (
          <span className="text-lg font-bold tracking-tight text-foreground">
            AirQ
          </span>
        )}

        {/* Mobile close button */}
        {isMobileOverlay && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Navigation links */}
      <ul className="flex-1 overflow-y-auto py-2 px-2 space-y-1" role="list">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const isCollapsedDesktop = collapsed && !isMobileOverlay;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={isMobileOverlay ? onToggle : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsedDesktop && 'justify-center px-2'
                )}
                aria-current={active ? 'page' : undefined}
                title={isCollapsedDesktop ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!isCollapsedDesktop && (
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.label}</span>
                    {!collapsed && (
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Collapse toggle — desktop only */}
      {!isMobileOverlay && (
        <div className="border-t border-border p-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('w-full', collapsed ? '' : 'ml-auto')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </nav>
  );
}
