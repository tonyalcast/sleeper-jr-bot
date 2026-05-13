import { browser } from 'wxt/browser';
import { storage } from 'wxt/utils/storage';

export const ACTIVITY_LOG_APPEND = 'ij-activity-log-append' as const;

export type ActivityLogLevel = 'info' | 'warn' | 'error';

export interface ActivityLogEntry {
  id: string;
  ts: number;
  source: string;
  level: ActivityLogLevel;
  message: string;
  detail?: string;
}

export type ActivityLogAppendPayload = {
  source: string;
  message: string;
  level?: ActivityLogLevel;
  detail?: string;
};

export interface ActivityLogAppendMessage {
  type: typeof ACTIVITY_LOG_APPEND;
  payload: ActivityLogAppendPayload;
}

/** Newest-first activity feed for the popup debug panel. */
export const activityLogItem = storage.defineItem<ActivityLogEntry[]>('local:activityLog', {
  fallback: [],
});

const MAX_ENTRIES = 150;

let appendChain: Promise<void> = Promise.resolve();

export function isActivityLogAppendMessage(msg: unknown): msg is ActivityLogAppendMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'type' in msg &&
    (msg as { type: string }).type === ACTIVITY_LOG_APPEND
  );
}

/** Append from any extension context (serialized in the background). */
export async function appendActivityLog(payload: ActivityLogAppendPayload): Promise<void> {
  try {
    await browser.runtime.sendMessage({
      type: ACTIVITY_LOG_APPEND,
      payload,
    } satisfies ActivityLogAppendMessage);
  } catch {
    // No SW / unloaded receiver — ignore
  }
}

/** Direct persist (background only). */
export async function persistActivityLogAppend(payload: ActivityLogAppendPayload): Promise<void> {
  appendChain = appendChain.then(async () => {
    const list = await activityLogItem.getValue();
    const entry: ActivityLogEntry = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: payload.level ?? 'info',
      source: payload.source,
      message: payload.message,
      detail: payload.detail,
    };
    await activityLogItem.setValue([entry, ...list].slice(0, MAX_ENTRIES));
  });
  return appendChain;
}
