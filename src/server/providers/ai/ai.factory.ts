import { env } from '@/lib/env';
import type { IAiProvider } from './ai.interface';
import { OpenAiProvider } from './openai/openai.provider';
import { RuleBasedAiProvider } from './fallback/rule-based-ai.provider';

export function getAiProvider(): IAiProvider {
  if (env.OPENAI_API_KEY) {
    return new OpenAiProvider(env.OPENAI_API_KEY);
  }

  return new RuleBasedAiProvider();
}
