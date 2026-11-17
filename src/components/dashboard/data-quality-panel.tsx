import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DataQualityMetrics {
  totalPollutants: number;
  validPollutants: number;
  suspectPollutants: number;
  missingPollutants: number;
  dataSufficiency: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
  lastValidationTime: Date;
}

interface DataQualityPanelProps {
  metrics: DataQualityMetrics;
  className?: string;
}

export function DataQualityPanel({ metrics, className }: DataQualityPanelProps) {
  const validPercentage = Math.round(
    (metrics.validPollutants / metrics.totalPollutants) * 100
  );

  const getSufficiencyDetails = () => {
    switch (metrics.dataSufficiency) {
      case 'SUFFICIENT':
        return {
          label: 'Sufficient',
          description: 'All required pollutants available for accurate AQI',
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950',
        };
      case 'PARTIAL':
        return {
          label: 'Partial',
          description: 'Some pollutants missing, AQI calculated from available data',
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-950',
        };
      case 'INSUFFICIENT':
        return {
          label: 'Insufficient',
          description: 'Not enough data for reliable AQI calculation',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950',
        };
    }
  };

  const sufficiency = getSufficiencyDetails();
  const SufficiencyIcon = sufficiency.icon;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Data Quality Assessment
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time validation of measurement reliability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Sufficiency Status */}
        <div className={cn('rounded-lg p-3', sufficiency.bgColor)}>
          <div className="flex items-start gap-3">
            <SufficiencyIcon className={cn('h-5 w-5 mt-0.5', sufficiency.color)} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('text-sm font-semibold', sufficiency.color)}>
                  {sufficiency.label} Data Quality
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {validPercentage}% Valid
                </Badge>
              </div>
              <p className="text-xs text-foreground/80">{sufficiency.description}</p>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Valid</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.validPollutants}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Suspect</span>
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.suspectPollutants}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Missing</span>
              <XCircle className="h-3.5 w-3.5 text-red-600" />
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.missingPollutants}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <Info className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.totalPollutants}
            </p>
          </div>
        </div>

        {/* Last Validation */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
          <span>Last Validated:</span>
          <span className="font-medium text-foreground">
            {metrics.lastValidationTime.toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
