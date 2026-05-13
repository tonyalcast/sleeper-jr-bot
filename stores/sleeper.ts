import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AiProviderId } from '@/utils/messages';
import { appendActivityLog } from '@/utils/activity-log';
import {
  boredClassSleeperEnabledItem,
  sleeperAiProviderItem,
  sleeperApiKeyItem,
  sleeperDisplayNameItem,
} from '@/utils/storage-items';

export const useSleeperStore = defineStore('sleeper', () => {
  const displayName = ref('');
  const aiProvider = ref<AiProviderId>('openai');
  const apiKey = ref('');
  const boredClassEnabled = ref(false);
  let watchersRegistered = false;

  async function hydrate() {
    displayName.value = await sleeperDisplayNameItem.getValue();
    aiProvider.value = await sleeperAiProviderItem.getValue();
    apiKey.value = await sleeperApiKeyItem.getValue();
    boredClassEnabled.value = await boredClassSleeperEnabledItem.getValue();

    if (!watchersRegistered) {
      watchersRegistered = true;
      sleeperDisplayNameItem.watch((v) => {
        displayName.value = v;
      });
      sleeperAiProviderItem.watch((v) => {
        aiProvider.value = v;
      });
      sleeperApiKeyItem.watch((v) => {
        apiKey.value = v;
      });
      boredClassSleeperEnabledItem.watch((v) => {
        boredClassEnabled.value = v;
      });
    }
  }

  async function setDisplayName(value: string) {
    displayName.value = value;
    await sleeperDisplayNameItem.setValue(value);
  }

  async function setAiProvider(value: AiProviderId) {
    aiProvider.value = value;
    await sleeperAiProviderItem.setValue(value);
  }

  async function setApiKey(value: string) {
    apiKey.value = value;
    await sleeperApiKeyItem.setValue(value);
  }

  async function setBoredClassEnabled(value: boolean) {
    boredClassEnabled.value = value;
    await boredClassSleeperEnabledItem.setValue(value);
    void appendActivityLog({
      source: 'extension',
      message: value ? 'BoredClass Sleeper enabled' : 'BoredClass Sleeper disabled',
    });
  }

  return {
    displayName,
    aiProvider,
    apiKey,
    boredClassEnabled,
    hydrate,
    setDisplayName,
    setAiProvider,
    setApiKey,
    setBoredClassEnabled,
  };
});
