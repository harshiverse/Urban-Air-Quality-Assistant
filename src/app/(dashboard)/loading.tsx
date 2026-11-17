import { DashboardSkeleton } from '@/components/dashboard';

/**
 * Dashboard loading state using skeleton components that mirror the actual layout.
 * Displayed automatically by Next.js during route segment loading.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
