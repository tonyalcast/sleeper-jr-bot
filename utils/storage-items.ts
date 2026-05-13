import { storage } from 'wxt/utils/storage';
import type { AiProviderId } from '@/utils/messages';

export const extensionEnabledItem = storage.defineItem<boolean>('local:extensionEnabled', {
  fallback: true,
});

export const sleeperDisplayNameItem = storage.defineItem<string>('local:sleeperDisplayName', {
  fallback: '',
});

export const sleeperAiProviderItem = storage.defineItem<AiProviderId>('local:sleeperAiProvider', {
  fallback: 'openai',
});

export const sleeperApiKeyItem = storage.defineItem<string>('local:sleeperApiKey', {
  fallback: '',
});

/** When false, the Coursera BoredClass Sleeper content UI stays inactive. */
export const boredClassSleeperEnabledItem = storage.defineItem<boolean>('local:boredClassSleeperEnabled', {
  fallback: false,
});
