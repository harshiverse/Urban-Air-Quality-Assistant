'use client';

import * as React from 'react';
import {
  AlertCircle,
  Bot,
  Check,
  CloudSun,
  Copy,
  Layers,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AiAssistantResponseDto,
  AiGroundingContext,
  ChatMessage,
} from '@/features/assistant/types';
import { formatAqiValue, getAqiCategory } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export interface AssistantChatProps {
  initialLocation: string;
  initialContext: AiGroundingContext;
  supportedCities: readonly string[];
}

interface MessageItem extends ChatMessage {
  groundingContext?: AiGroundingContext;
  isFallback?: boolean;
  provider?: string;
  model?: string;
  suggestions?: string[];
}

const DEFAULT_QUESTIONS = [
  'What is the current air quality in this area?',
  'Why is the AQI at this level right now?',
  'Is it safe for outdoor exercise or running today?',
  'What is PM2.5 and why is it dangerous?',
  'How does the current weather affect pollution levels?',
  'What everyday precautions should I take today?',
];

export function AssistantChat({
  initialLocation,
  initialContext,
  supportedCities,
}: AssistantChatProps) {
  const [currentCity, setCurrentCity] = React.useState(initialLocation);
  const [activeContext, setActiveContext] = React.useState<AiGroundingContext>(initialContext);
  const [messages, setMessages] = React.useState<MessageItem[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **Urban Air Quality Environmental Assistant**.\n\nI provide evidence-based guidance strictly grounded in verified Central Pollution Control Board (**CPCB**) monitoring data. I will never invent measurements or give medical diagnoses.\n\nCurrently monitoring **${initialContext.stationName}** in **${initialLocation}** (AQI: **${formatAqiValue(initialContext.aqi)}** - ${initialContext.categoryLabel}). How can I help you today?`,
      timestamp: new Date().toISOString(),
      groundingContext: initialContext,
      suggestions: [
        'Why is the air quality at this level today?',
        'Is it safe to run or exercise outdoors?',
        'What precautions should sensitive groups take?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [inspectingContext, setInspectingContext] = React.useState<AiGroundingContext | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCityChange = async (city: string) => {
    setCurrentCity(city);
    // Fetch updated context snapshot for new city
    try {
      const res = await fetch(`/api/v1/air-quality/current?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const snapshot = json.data;
          setActiveContext((prev) => ({
            ...prev,
            location: snapshot.city,
            stationName: snapshot.station.name,
            stationCode: snapshot.station.stationCode,
            aqi: snapshot.aqi,
            category: snapshot.category,
            categoryLabel: snapshot.categoryLabel,
            dominantPollutant: snapshot.dominantPollutant,
            dominantPollutantName: snapshot.dominantPollutantName,
            measurementTimestamp: snapshot.measurementTimestamp,
            measurementStatus: snapshot.measurementStatus,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to update context for city:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputMessage('');

    const userMsg: MessageItem = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Build lightweight conversation history
      const history = nextMessages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/v1/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          location: currentCity,
          stationCode: activeContext.stationCode,
          conversationHistory: history.slice(0, -1),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || 'Failed to generate assistant response');
      }

      const json = await res.json();
      const responseData: AiAssistantResponseDto = json.data;

      const assistantMsg: MessageItem = {
        role: 'assistant',
        content: responseData.reply,
        timestamp: responseData.generatedAt,
        groundingContext: responseData.groundingContext,
        isFallback: responseData.isFallback,
        provider: responseData.provider,
        model: responseData.model,
        suggestions: responseData.suggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActiveContext(responseData.groundingContext);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while connecting to the assistant.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. Currently monitoring **${activeContext.stationName}** in **${currentCity}**. How can I help?`,
        timestamp: new Date().toISOString(),
        groundingContext: activeContext,
        suggestions: DEFAULT_QUESTIONS.slice(0, 3),
      },
    ]);
    setErrorMsg(null);
  };

  const aqiCat = activeContext.aqi !== null ? getAqiCategory(activeContext.aqi) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Chat Column */}
      <Card className="lg:col-span-2 flex flex-col h-[750px] shadow-sm bg-card/70 border-border/80">
        {/* Chat Header Toolbar */}
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>Environmental AI Assistant</span>
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 font-medium">
                  CPCB Grounded
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                <span className="truncate max-w-[220px]">{activeContext.stationName}</span>
                {aqiCat && (
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-semibold text-white"
                    style={{ backgroundColor: aqiCat.color }}
                  >
                    AQI {formatAqiValue(activeContext.aqi)}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Location Switcher */}
            <Select value={currentCity} onValueChange={handleCityChange}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <MapPin className="h-3 w-3 mr-1 text-primary shrink-0" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {supportedCities.map((city) => (
                  <SelectItem key={city} value={city} className="text-xs">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Message Thread */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const msgId = msg.id || `msg-${idx}`;

            return (
              <div
                key={msgId}
                className={cn('flex gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold',
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border border-border/80 text-foreground'
                  )}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div
                    className={cn(
                      'p-3.5 rounded-2xl text-xs leading-relaxed',
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted/70 text-foreground border border-border/60 rounded-tl-none space-y-2'
                    )}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    {!isUser && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                          <span>{msg.provider || 'CPCB Grounded Engine'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {msg.groundingContext && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectingContext(msg.groundingContext!)}
                              className="h-5 px-1.5 text-[10px] text-primary hover:text-primary/80"
                            >
                              <Layers className="h-2.5 w-2.5 mr-1" />
                              Inspect Data
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(msg.content, msgId)}
                            className="h-5 px-1.5 text-[10px]"
                            title="Copy message"
                          >
                            {copiedId === msgId ? (
                              <Check className="h-2.5 w-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-full bg-accent/50 hover:bg-accent border border-border/60 text-[11px] text-foreground transition-colors text-left flex items-center gap-1"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-primary shrink-0" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 mr-auto max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-muted border border-border/80 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 rounded-tl-none flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Consulting CPCB monitoring observations & atmospheric dynamics...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage()}
                className="h-6 text-[10px] border-rose-500/40 text-rose-500"
              >
                Retry
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Bar */}
        <CardFooter className="p-3 border-t border-border/60 flex flex-col gap-2 bg-card/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex w-full items-center gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask about ${currentCity} air quality, exercise safety, pollutants, or precautions...`}
              disabled={isLoading}
              className="text-xs h-10"
              maxLength={500}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !inputMessage.trim()}
              className="h-10 px-4 gap-1.5"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground px-1">
            <span>Grounding: CPCB CAAQMS Network • Zero Fabricated Data</span>
            <span>Max 500 characters</span>
          </div>
        </CardFooter>
      </Card>

      {/* Side Context & Grounding Inspection Column */}
      <div className="space-y-6">
        {/* Current Grounding Snapshot Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Verified Context Grounding</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {activeContext.measurementStatus}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              The AI assistant is strictly bound to these server-retrieved measurements.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            {/* Station & AQI Snapshot */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Station:</span>
                <span className="font-semibold text-foreground truncate max-w-[170px]">
                  {activeContext.stationName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Official AQI:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-base text-foreground">
                    {formatAqiValue(activeContext.aqi)}
                  </span>
                  {aqiCat && (
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-semibold text-white"
                      style={{ backgroundColor: aqiCat.color }}
                    >
                      {aqiCat.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Dominant Pollutant:</span>
                <span className="font-semibold uppercase text-foreground">
                  {activeContext.dominantPollutantName || activeContext.dominantPollutant || 'N/A'}
                </span>
              </div>
            </div>

            {/* Weather Correlation Snapshot */}
            {activeContext.weather && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <CloudSun className="h-3.5 w-3.5 text-primary" />
                    <span>Atmospheric Context:</span>
                  </span>
                  <span className="text-foreground font-medium">{activeContext.weather.condition}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div>Temp: {activeContext.weather.temperature}°C</div>
                  <div>Humidity: {activeContext.weather.humidity}%</div>
                  <div>Wind: {activeContext.weather.windSpeed} km/h ({activeContext.weather.windDirection})</div>
                  <div>Inversion: {activeContext.weather.inversionRisk}</div>
                </div>
              </div>
            )}

            {/* Pollutants Table */}
            <div className="space-y-1.5">
              <div className="font-medium text-muted-foreground text-[11px]">Active Pollutant Sub-Indices:</div>
              <div className="divide-y divide-border/40 border border-border/60 rounded-lg overflow-hidden font-mono text-[11px]">
                {activeContext.pollutants.slice(0, 5).map((p) => (
                  <div key={p.pollutant} className="flex items-center justify-between p-2 bg-card/40">
                    <span className="font-sans font-medium text-foreground">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {p.concentration !== null ? `${p.concentration} ${p.unit}` : 'N/A'}
                      </span>
                      <span className="font-bold text-foreground">
                        {p.subIndex !== null ? `(${p.subIndex})` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions Quick Palette */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Common Environmental Queries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {DEFAULT_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded-lg hover:bg-accent/60 transition-colors border border-border/40 text-muted-foreground hover:text-foreground text-[11px] block"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inspecting Context Modal / Drawer View */}
      {inspectingContext && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xl w-full max-h-[85vh] overflow-y-auto">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Server-Side Grounding Provenance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Exact environmental observation snapshot injected into the assistant prompt.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectingContext(null)}
                className="h-8 px-2"
              >
                Close
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-mono">
              <div className="p-3 rounded bg-muted/60 text-[11px] space-y-1">
                <div><strong>Location:</strong> {inspectingContext.location}</div>
                <div><strong>Station:</strong> {inspectingContext.stationName} ({inspectingContext.stationCode})</div>
                <div><strong>Official AQI:</strong> {inspectingContext.aqi} ({inspectingContext.categoryLabel})</div>
                <div><strong>Dominant:</strong> {inspectingContext.dominantPollutantName}</div>
                <div><strong>Timestamp:</strong> {inspectingContext.measurementTimestamp}</div>
                <div><strong>Source:</strong> {inspectingContext.sourceAttribution}</div>
              </div>

              <div>
                <div className="font-semibold text-foreground mb-1 font-sans">Pollutants Sub-Index Table:</div>
                <div className="border border-border/60 rounded divide-y divide-border/40 text-[11px]">
                  {inspectingContext.pollutants.map((p) => (
                    <div key={p.pollutant} className="p-2 flex justify-between">
                      <span>{p.name} ({p.pollutant})</span>
                      <span>
                        {p.concentration} {p.unit} → Sub-Index: {p.subIndex} [{p.category}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {inspectingContext.weather && (
                <div>
                  <div className="font-semibold text-foreground mb-1 font-sans">Atmospheric Parameters:</div>
                  <div className="p-2.5 rounded bg-muted/40 text-[11px] space-y-0.5">
                    <div>Temp: {inspectingContext.weather.temperature}°C | Humidity: {inspectingContext.weather.humidity}%</div>
                    <div>Wind: {inspectingContext.weather.windSpeed} km/h ({inspectingContext.weather.windDirection})</div>
                    <div>Inversion Risk: {inspectingContext.weather.inversionRisk} | Dispersion: {inspectingContext.weather.dispersionPotential}</div>
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-sans text-[11px]">
                ✓ Verified: All answers are strictly grounded in CPCB NAQI methodology. Zero fabricated sensor measurements.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
