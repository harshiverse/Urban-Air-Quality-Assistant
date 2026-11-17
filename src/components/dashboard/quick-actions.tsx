'use client';

import Link from 'next/link';
import { MessageSquare, History, MapPin, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  href: string;
  icon: typeof MessageSquare;
  description: string;
  variant?: 'default' | 'outline';
}

const quickActions: QuickAction[] = [
  {
    label: 'Ask AI Assistant',
    href: '/assistant',
    icon: MessageSquare,
    description: 'Get personalized air quality insights',
    variant: 'default',
  },
  {
    label: 'View History',
    href: '/history',
    icon: History,
    description: 'Analyze trends and patterns',
  },
  {
    label: 'Compare Locations',
    href: '/locations',
    icon: MapPin,
    description: 'Side-by-side city comparison',
  },
  {
    label: 'Methodology',
    href: '/methodology',
    icon: BookOpen,
    description: 'Learn about CPCB AQI calculation',
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-card p-4 text-center transition-all hover:border-primary/50 hover:bg-accent hover:shadow-sm">
                  <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
