import {
  AI_COMPLETION_MESSAGE,
  isAiCompletionRequest,
  type AiCompletionResponse,
} from '@/utils/messages';
import { runAiCompletion } from '@/utils/ai-completion';
import {
  isActivityLogAppendMessage,
  persistActivityLogAppend,
} from '@/utils/activity-log';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    if (isActivityLogAppendMessage(message)) {
      void persistActivityLogAppend(message.payload)
        .then(() => sendResponse({ ok: true }))
        .catch(() => sendResponse({ ok: false }));
      return true;
    }

    if (!isAiCompletionRequest(message)) {
      return false;
    }
    if (message.type !== AI_COMPLETION_MESSAGE) {
      return false;
    }

    const tabId = sender.tab?.id;
    const tabHint = tabId != null ? `tab ${tabId}` : 'extension page';

    void persistActivityLogAppend({
      source: 'background',
      message: 'AI completion requested',
      detail: `${message.provider} · ${tabHint}`,
    });

    void (async () => {
      let response: AiCompletionResponse;
      try {
        const text = await runAiCompletion(
          message.provider,
          message.apiKey,
          message.systemPrompt,
          message.userPrompt,
        );
        response = { ok: true, text };
        void persistActivityLogAppend({
          source: 'background',
          message: 'AI completion finished',
          detail: `${message.provider} · ${text.length} chars`,
        });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        response = { ok: false, error };
        void persistActivityLogAppend({
          source: 'background',
          level: 'error',
          message: 'AI completion failed',
          detail: error,
        });
      }
      sendResponse(response);
    })();
    return true;
  });
});
