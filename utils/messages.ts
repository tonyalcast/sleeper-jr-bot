export const AI_COMPLETION_MESSAGE = 'ij-sleeper-ai-completion' as const;

export type AiProviderId = 'openai' | 'anthropic' | 'google' | 'deepseek';

export interface AiCompletionRequest {
  type: typeof AI_COMPLETION_MESSAGE;
  provider: AiProviderId;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
}

export type AiCompletionResponse =
  | { ok: true; text: string }
  | { ok: false; error: string };

export function isAiCompletionRequest(msg: unknown): msg is AiCompletionRequest {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'type' in msg &&
    (msg as { type: string }).type === AI_COMPLETION_MESSAGE
  );
}
