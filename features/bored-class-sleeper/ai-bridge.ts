import { browser } from 'wxt/browser';
import {
  AI_COMPLETION_MESSAGE,
  type AiCompletionRequest,
  type AiCompletionResponse,
  type AiProviderId,
} from '@/utils/messages';
import { sleeperAiProviderItem, sleeperApiKeyItem } from '@/utils/storage-items';

export async function loadAiConfig(): Promise<{ provider: AiProviderId; apiKey: string } | null> {
  const [provider, apiKey] = await Promise.all([
    sleeperAiProviderItem.getValue(),
    sleeperApiKeyItem.getValue(),
  ]);
  if (!apiKey.trim()) return null;
  return { provider, apiKey };
}

export async function callAiCompletion(
  systemPrompt: string,
  userPrompt: string,
): Promise<AiCompletionResponse> {
  const cfg = await loadAiConfig();
  if (!cfg) {
    return { ok: false, error: 'Missing API key in extension options.' };
  }
  const payload: AiCompletionRequest = {
    type: AI_COMPLETION_MESSAGE,
    provider: cfg.provider,
    apiKey: cfg.apiKey,
    systemPrompt,
    userPrompt,
  };
  const res = (await browser.runtime.sendMessage(payload)) as AiCompletionResponse;
  if (!res || typeof res !== 'object') {
    return { ok: false, error: 'No response from extension background' };
  }
  return res;
}
