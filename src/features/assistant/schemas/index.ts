import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(2000),
  timestamp: z.string().optional(),
});

export const AiAssistantRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message cannot exceed 500 characters'),
  location: z.string().max(100).optional().default('Delhi'),
  stationCode: z.string().max(50).optional(),
  conversationHistory: z.array(ChatMessageSchema).max(10).optional().default([]),
});

export type AiAssistantRequestInput = z.infer<typeof AiAssistantRequestSchema>;
