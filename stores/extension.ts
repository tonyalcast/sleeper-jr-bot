import { defineStore } from 'pinia';
import { ref } from 'vue';
import { appendActivityLog } from '@/utils/activity-log';
import { extensionEnabledItem } from '@/utils/storage-items';

export const useExtensionStore = defineStore('extension', () => {
  const extensionEnabled = ref(true);
  let watchersRegistered = false;

  async function hydrate() {
    extensionEnabled.value = await extensionEnabledItem.getValue();

    if (!watchersRegistered) {
      watchersRegistered = true;
      extensionEnabledItem.watch((newVal) => {
        extensionEnabled.value = newVal;
      });
    }
  }

  async function setExtensionEnabled(value: boolean) {
    extensionEnabled.value = value;
    await extensionEnabledItem.setValue(value);
    void appendActivityLog({
      source: 'extension',
      message: value ? 'Extension enabled (master)' : 'Extension paused (master)',
    });
  }

  return {
    extensionEnabled,
    hydrate,
    setExtensionEnabled,
  };
});
