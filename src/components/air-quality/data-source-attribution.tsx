import * as React from 'react';

import { cn } from '@/lib/utils';

export interface DataSourceAttributionProps {
  /** Data source name (e.g. "CPCB") */
  source: string;
  /** Monitoring station name */
  stationName?: string;
  /** Station identifier */
  stationId?: string;
  className?: string;
}

/**
 * Small attribution component showing data source and station information.
 * Renders inline, e.g. "Source: CPCB • Station: ITO, Delhi (DL001)"
 */
const DataSourceAttribution = React.forwardRef<
  HTMLParagraphElement,
  DataSourceAttributionProps
>(({ source, stationName, stationId, className }, ref) => {
  const parts: string[] = [`Source: ${source}`];

  if (stationName) {
    const stationPart = stationId
      ? `Station: ${stationName} (${stationId})`
      : `Station: ${stationName}`;
    parts.push(stationPart);
  } else if (stationId) {
    parts.push(`Station ID: ${stationId}`);
  }

  return (
    <p
      ref={ref}
      className={cn('text-xs text-muted-foreground', className)}
      aria-label={`Data attribution: ${parts.join(', ')}`}
    >
      {parts.join(' • ')}
    </p>
  );
});
DataSourceAttribution.displayName = 'DataSourceAttribution';

export { DataSourceAttribution };
