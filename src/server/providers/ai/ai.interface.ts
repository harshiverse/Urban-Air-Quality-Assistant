import type { AiGroundingContext, ChatMessage } from '@/features/assistant/types';

export interface AiPromptPayload {
  systemPrompt: string;
  userMessage: string;
  conversationHistory: ChatMessage[];
  context: AiGroundingContext;
}

export interface AiGenerationResult {
  reply: string;
  suggestions: string[];
  provider: string;
  model: string;
  isFallback: boolean;
}

export interface IAiProvider {
  readonly id: string;
  generateResponse(payload: AiPromptPayload): Promise<AiGenerationResult>;
}
