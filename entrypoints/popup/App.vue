<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { browser } from 'wxt/browser';
import FileCleanerPanel from '@/components/FileCleanerPanel.vue';
import { useExtensionStore } from '@/stores/extension';
import { useSleeperStore } from '@/stores/sleeper';
import { appendActivityLog, activityLogItem, type ActivityLogEntry } from '@/utils/activity-log';
import { BrandHeader, Button, SurfaceCard, ToggleRow } from '@/components/ui';

const extensionStore = useExtensionStore();
const sleeperStore = useSleeperStore();
const { displayName, apiKey } = storeToRefs(sleeperStore);

const activityLog = ref<ActivityLogEntry[]>([]);

const apiKeyPresent = computed(() => apiKey.value.trim().length > 0);

const enabledModel = computed({
  get: () => extensionStore.extensionEnabled,
  set: (v: boolean) => {
    void extensionStore.setExtensionEnabled(v);
  },
});

const boredClassModel = computed({
  get: () => sleeperStore.boredClassEnabled,
  set: (v: boolean) => {
    void sleeperStore.setBoredClassEnabled(v);
  },
});

function formatLogTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

onMounted(() => {
  void activityLogItem.getValue().then((entries) => {
    activityLog.value = entries;
  });
  activityLogItem.watch((entries) => {
    activityLog.value = entries;
  });
});

/** Opens options; `tabs.create` works even when `options_ui` is missing (e.g. stale dev build). */
async function openOptionsPage() {
  void appendActivityLog({ source: 'popup', message: 'Opening options / settings' });
  const url = browser.runtime.getURL('/options.html');
  try {
    await browser.tabs.create({ url });
    return;
  } catch (err) {
    console.warn('[Sleeper Jr Bot] tabs.create failed, trying openOptionsPage', err);
  }
  try {
    await browser.runtime.openOptionsPage();
  } catch (err) {
    console.error('[Sleeper Jr Bot] Could not open the options page', err);
  }
}
</script>

<template>
  <div class="popup">
    <BrandHeader variant="popup">
      <template #subtitle>
        <p>
          {{ displayName ? `Sleeper: ${displayName}` : 'Configure your Sleeper profile in options' }}
        </p>
      </template>
    </BrandHeader>

    <SurfaceCard variant="form">
      <ToggleRow
        v-model="enabledModel"
        title="Status"
        label-on="On"
        label-off="Paused"
        density="compact"
        :bordered="false"
      />
      <ToggleRow
        v-model="boredClassModel"
        title="BoredClass (Coursera)"
        label-on="On"
        label-off="Off"
        density="compact"
        :bordered="false"
      />

      <p v-if="boredClassModel && !apiKeyPresent" class="popup__hint">
        Add an API key in options to enable AI quiz &amp; assignment drafts on Coursera.
      </p>

      <Button variant="ghost" class="popup__btn-full" @click="openOptionsPage">Settings</Button>
    </SurfaceCard>

    <SurfaceCard variant="form" class="popup__file-cleaner-card">
      <p class="popup__file-cleaner-lead">FileCleaner — strip PDF metadata</p>
      <p class="popup__file-cleaner-desc">
        Choose a PDF from your device, preview its properties, then strip metadata and download a clean copy
        (processed locally).
      </p>
      <FileCleanerPanel compact />
    </SurfaceCard>

    <details class="popup__log">
      <summary class="popup__log-summary">
        Activity log
        <span v-if="activityLog.length" class="popup__log-count">{{ activityLog.length }}</span>
      </summary>
      <div v-if="activityLog.length === 0" class="popup__log-empty">No entries yet.</div>
      <ul v-else class="popup__log-list">
        <li
          v-for="entry in activityLog"
          :key="entry.id"
          :class="['popup__log-item', entry.level === 'error' && 'popup__log-item--err']"
        >
          <span class="popup__log-meta">
            <time :datetime="new Date(entry.ts).toISOString()">{{ formatLogTime(entry.ts) }}</time>
            <span class="popup__log-src">{{ entry.source }}</span>
          </span>
          <span class="popup__log-msg">{{ entry.message }}</span>
          <span v-if="entry.detail" class="popup__log-detail">{{ entry.detail }}</span>
        </li>
      </ul>
    </details>

    <p class="popup__note">
      On Coursera, open a course page to see the floating BoredClass panel (extension + feature must be on).
    </p>
  </div>
</template>

<style scoped>
.popup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 420px;
  max-width: 520px;
  padding: 1rem 1.1rem 1.15rem;
  text-align: left;
}

.popup :deep(.ui-card--form) {
  gap: 0.85rem;
}

.popup__hint {
  margin: 0;
  font-size: 0.72rem;
  color: var(--ij-muted);
}

.popup__log {
  margin: 0;
  border-radius: 0.65rem;
  border: 1px solid var(--ij-border);
  background: color-mix(in srgb, var(--ij-surface) 88%, transparent);
  overflow: hidden;
}

.popup__log-summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 650;
  color: var(--ij-text);
  user-select: none;
}

.popup__log-summary::-webkit-details-marker {
  display: none;
}

.popup__log-summary::before {
  content: '▸';
  font-size: 0.65rem;
  opacity: 0.55;
  transition: transform 0.15s ease;
}

.popup__log[open] .popup__log-summary::before {
  transform: rotate(90deg);
}

.popup__log-count {
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--ij-muted);
  background: color-mix(in srgb, var(--ij-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--ij-accent) 35%, transparent);
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
  color: color-mix(in srgb, var(--ij-accent) 80%, var(--ij-text));
}

.popup__log-empty {
  padding: 0 0.65rem 0.6rem;
  font-size: 0.68rem;
  color: var(--ij-muted);
}

.popup__log-list {
  list-style: none;
  margin: 0;
  padding: 0 0.45rem 0.55rem;
  max-height: 220px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.popup__log-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.35rem 0.35rem;
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--ij-bg) 65%, transparent);
  border: 1px solid color-mix(in srgb, var(--ij-border) 70%, transparent);
  font-size: 0.65rem;
  line-height: 1.35;
}

.popup__log-item--err {
  border-color: color-mix(in srgb, #f87171 45%, var(--ij-border));
}

.popup__log-meta {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-variant-numeric: tabular-nums;
  color: var(--ij-muted);
  font-size: 0.62rem;
}

.popup__log-src {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 650;
  font-size: 0.58rem;
  color: color-mix(in srgb, var(--ij-accent) 75%, var(--ij-muted));
}

.popup__log-msg {
  color: var(--ij-text);
  font-weight: 500;
}

.popup__log-detail {
  color: var(--ij-muted);
  font-size: 0.6rem;
  word-break: break-word;
}

.popup__note {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.45;
  color: var(--ij-muted);
  opacity: 0.9;
}

.popup__btn-full {
  width: 100%;
}

.popup__file-cleaner-card :deep(.ui-card--form) {
  gap: 0.65rem;
}

.popup__file-cleaner-lead {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ij-text);
}

.popup__file-cleaner-desc {
  margin: 0;
  font-size: 0.68rem;
  line-height: 1.4;
  color: var(--ij-muted);
}
</style>
