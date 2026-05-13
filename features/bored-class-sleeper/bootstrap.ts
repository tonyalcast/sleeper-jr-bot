import { browser } from 'wxt/browser';
import { appendActivityLog } from '@/utils/activity-log';
import { boredClassSleeperEnabledItem, extensionEnabledItem } from '@/utils/storage-items';
import { PANEL_HOST_ID } from '@/features/bored-class-sleeper/constants';
import { mountBoredClassPanel } from '@/features/bored-class-sleeper/panel';

export async function mountWhenReady(): Promise<void> {
  const [extOn, featureOn] = await Promise.all([
    extensionEnabledItem.getValue(),
    boredClassSleeperEnabledItem.getValue(),
  ]);

  if (extOn && featureOn) {
    mountBoredClassPanel();
  }

  registerStorageSync();
}

let storageSyncRegistered = false;

function registerStorageSync(): void {
  if (storageSyncRegistered) return;
  storageSyncRegistered = true;

  const trySync = async () => {
    const [extOn, featureOn] = await Promise.all([
      extensionEnabledItem.getValue(),
      boredClassSleeperEnabledItem.getValue(),
    ]);
    const shouldShow = extOn && featureOn;
    const el = document.getElementById(PANEL_HOST_ID);

    if (shouldShow && !el) {
      mountBoredClassPanel();
    } else if (!shouldShow && el) {
      void appendActivityLog({
        source: 'coursera',
        message: 'BoredClass panel closed (toggles off)',
        detail: location.pathname.slice(0, 96),
      });
      el.remove();
    }
  };

  browser.storage.onChanged.addListener(() => {
    void trySync();
  });
}
