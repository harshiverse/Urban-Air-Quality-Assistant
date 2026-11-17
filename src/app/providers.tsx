'use client';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * Client-side providers wrapper.
 * Wraps the application in ThemeProvider and renders the global Toaster.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
