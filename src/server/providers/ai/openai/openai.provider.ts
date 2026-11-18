import OpenAI from 'openai';
import type { IAiProvider, AiPromptPayload, AiGenerationResult } from '../ai.interface';
import { RuleBasedAiProvider } from '../fallback/rule-based-ai.provider';

export class OpenAiProvider implements IAiProvider {
  public readonly id = 'OPENAI_ASSISTANT_PROVIDER';
  private client: OpenAI | null = null;
  private readonly fallbackProvider: RuleBasedAiProvider;

  constructor(apiKey?: string) {
    this.fallbackProvider = new RuleBasedAiProvider();
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  public async generateResponse(payload: AiPromptPayload): Promise<AiGenerationResult> {
    if (!this.client) {
      return this.fallbackProvider.generateResponse(payload);
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: payload.systemPrompt,
        },
      ];

      // Append past conversation history
      for (const msg of payload.conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      // Append current user message
      messages.push({
        role: 'user',
        content: payload.userMessage,
      });

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2, // Low temperature for factual precision
        max_tokens: 800,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse suggestions if present or extract default contextual suggestions
      const suggestions = this.extractSuggestions(text, payload.context.location);
      const cleanReply = this.cleanReplyText(text);

      return {
        reply: cleanReply,
        suggestions,
        provider: 'OpenAI GPT-4o-mini',
        model: response.model || 'gpt-4o-mini',
        isFallback: false,
      };
    } catch (error) {
      console.warn('OpenAI invocation failed, falling back to rule-based assistant:', error);
      return this.fallbackProvider.generateResponse(payload);
    }
  }

  private extractSuggestions(text: string, city: string): string[] {
    const defaultSuggestions = [
      `What precautions should I consider in ${city}?`,
      `Is it safe for outdoor exercise today?`,
      `How does the current weather affect pollution?`,
    ];

    const match = text.match(/(?:Follow-up questions|Suggested questions|Suggestions):\s*([\s\S]*)$/i);
    if (!match || !match[1]) return defaultSuggestions;

    const lines = match[1]
      .split('\n')
      .map((l) => l.replace(/^[-*0-9.]+\s*/, '').trim())
      .filter((l) => l.endsWith('?') && l.length > 5);

    return lines.length >= 2 ? lines.slice(0, 3) : defaultSuggestions;
  }

  private cleanReplyText(text: string): string {
    // Strip trailing suggestions section from the primary reply markdown so suggestions render as interactive buttons in UI
    return text.replace(/(?:###?\s*(?:Follow-up questions|Suggested questions|Suggestions)[\s\S]*)$/i, '').trim();
  }
}
