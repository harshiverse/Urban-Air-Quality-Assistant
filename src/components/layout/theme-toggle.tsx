'use client';

import * as React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/layout/theme-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * 1-Click Smooth Theme Toggle.
 * Clicking directly flips between light and dark mode with an animated icon rotation.
 * Right-click or dropdown trigger offers system auto preference.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, preference, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Quick 1-click toggle between light and dark
  const handleToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-9 w-9 rounded-full', className)}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4 text-muted-foreground opacity-50" />
      </Button>
    );
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative h-9 w-9 rounded-full transition-transform active:scale-90 hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Toggle theme. Currently ${preference} mode. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
        title={`Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Sun Icon (visible in light mode, smoothly rotates away in dark) */}
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 text-amber-500" />

        {/* Moon Icon (visible in dark mode, smoothly rotates in) */}
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100 text-sky-400" />
      </Button>

      {/* Optional dropdown for system preference */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="sr-only sm:not-sr-only sm:flex items-center justify-center -ml-1 h-5 w-4 rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Theme options menu"
            title="More theme options"
          >
            ▾
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1.5 shadow-xl border-border/80">
          <DropdownMenuRadioGroup
            value={preference}
            onValueChange={(val) => setTheme(val as 'light' | 'dark' | 'system')}
          >
            <DropdownMenuRadioItem value="light" className="flex items-center gap-2 cursor-pointer">
              <Sun className="h-4 w-4 text-amber-500 mr-1" />
              <span>Light</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="flex items-center gap-2 cursor-pointer">
              <Moon className="h-4 w-4 text-sky-400 mr-1" />
              <span>Dark</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className="flex items-center gap-2 cursor-pointer">
              <Monitor className="h-4 w-4 text-muted-foreground mr-1" />
              <span>System</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Segmented Pill Theme Switcher with a sliding active indicator.
 * Perfect for settings or inline toggles.
 */
export function ThemeSegmentedToggle({ className }: { className?: string }) {
  const { preference, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-24 rounded-full bg-muted/50 animate-pulse" />;
  }

  const options: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'Auto', icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select color theme"
      className={cn(
        'inline-flex items-center rounded-full bg-muted p-1 text-muted-foreground border border-border/50',
        className
      )}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-out',
              isActive
                ? 'bg-background text-foreground shadow-sm scale-100 font-semibold'
                : 'text-muted-foreground hover:text-foreground active:scale-95'
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                isActive && value === 'light' && 'text-amber-500 scale-110',
                isActive && value === 'dark' && 'text-sky-400 scale-110',
                isActive && value === 'system' && 'text-primary scale-110'
              )}
              aria-hidden="true"
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
