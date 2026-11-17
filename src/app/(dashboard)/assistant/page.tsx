import type { Metadata } from 'next';
import { MessageSquare, Send, Info } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'AI Assistant',
};

const SAMPLE_QUESTIONS = [
  'What is the current air quality in Delhi?',
  'Why is PM2.5 high today?',
  'Which pollutant is most concerning right now?',
  'Is it safe to exercise outdoors?',
  'How does Delhi compare to Mumbai?',
  'What is the AQI methodology?',
] as const;

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Ask questions about air quality, pollutants, and get evidence-based guidance grounded in real monitoring data."
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'AI Assistant' },
            ]}
          />
        }
        actions={
          <Badge variant="outline" className="gap-1.5">
            <Info className="h-3 w-3" aria-hidden="true" />
            AI provider not configured
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
            <CardDescription>
              Your questions will be answered using verified air quality data from CPCB monitoring stations. The assistant will never invent measurements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Empty conversation state */}
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <MessageSquare
                  className="h-8 w-8 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="font-semibold text-foreground">
                  Start a conversation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask a question about air quality. The AI assistant uses real
                  monitoring data to provide context-aware, evidence-based
                  responses.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {/* Input area */}
            <div className="flex w-full gap-2">
              <Input
                placeholder="Ask about air quality…"
                aria-label="Type your question"
                disabled
              />
              <Button size="icon" disabled aria-label="Send message">
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Suggested questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suggested Questions</CardTitle>
              <CardDescription>
                Try asking one of these common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {SAMPLE_QUESTIONS.map((question) => (
                <button
                  key={question}
                  className="w-full rounded-md border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  disabled
                >
                  {question}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                AI Grounding Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                The AI assistant is designed to provide responses grounded in
                verified application data:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Never invents AQI values or pollutant concentrations</li>
                <li>Cites monitoring station and timestamp for every reading</li>
                <li>Clearly states when data is unavailable</li>
                <li>Does not diagnose health conditions</li>
                <li>Distinguishes between measurements and forecasts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
