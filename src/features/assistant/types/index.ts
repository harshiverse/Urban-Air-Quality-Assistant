import type { PollutantType, HistoricalSummary } from '@/features/air-quality/types';
import type { WeatherObservationDto } from '@/features/weather/types';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface GroundedPollutantItem {
  pollutant: PollutantType;
  name: string;
  concentration: number | null;
  unit: string;
  subIndex: number | null;
  category: string | null;
}

export interface AiGroundingContext {
  location: string;
  stationName: string;
  stationCode: string;
  aqi: number | null;
  category: string | null;
  categoryLabel: string;
  dominantPollutant: PollutantType | null;
  dominantPollutantName: string | null;
  pollutants: GroundedPollutantItem[];
  isDataSufficient: boolean;
  dataSufficiencyMessage: string;
  measurementStatus: string;
  measurementTimestamp: string;
  dataAgeHours: number;
  isStale: boolean;
  weather: WeatherObservationDto | null;
  historicalSummary: HistoricalSummary | null;
  sourceAttribution: string;
}

export interface AiAssistantRequestDto {
  message: string;
  location?: string;
  stationCode?: string;
  conversationHistory?: ChatMessage[];
}

export interface AiAssistantResponseDto {
  reply: string;
  groundingContext: AiGroundingContext;
  suggestions: string[];
  isFallback: boolean;
  provider: string;
  model: string;
  generatedAt: string;
}
