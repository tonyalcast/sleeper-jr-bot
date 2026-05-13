<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import FileCleanerPanel from '@/components/FileCleanerPanel.vue';
import { useExtensionStore } from '@/stores/extension';
import { useSleeperStore } from '@/stores/sleeper';
import type { AiProviderId } from '@/utils/messages';
import type { FeatureStatusRow } from '@/components/ui/types';
import { appendActivityLog } from '@/utils/activity-log';
import {
  ApiKeyInput,
  BrandHeader,
  FeatureStatusBoard,
  FormField,
  PageSection,
  ProviderSelect,
  SaveBar,
  SurfaceCard,
  TextInput,
  ToggleRow,
} from '@/components/ui';

const extensionStore = useExtensionStore();
const sleeperStore = useSleeperStore();
const draftDisplayName = ref('');
const draftAiProvider = ref<AiProviderId>('openai');
const draftApiKey = ref('');

const isSaving = ref(false);
const saveBanner = ref<'idle' | 'saved' | 'error'>('idle');

const extensionEnabledModel = computed({
  get: () => extensionStore.extensionEnabled,
  set: (v: boolean) => {
    void extensionStore.setExtensionEnabled(v);
  },
});

const boredClassEnabledModel = computed({
  get: () => sleeperStore.boredClassEnabled,
  set: (v: boolean) => {
    void sleeperStore.setBoredClassEnabled(v);
  },
});

const providerOptions: { value: AiProviderId; label: string }[] = [
  { value: 'openai', label: 'OpenAI (ChatGPT)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'deepseek', label: 'DeepSeek' },
];

function syncDraftFromStore() {
  draftDisplayName.value = sleeperStore.displayName;
  draftAiProvider.value = sleeperStore.aiProvider;
  draftApiKey.value = sleeperStore.apiKey;
}

onMounted(() => {
  syncDraftFromStore();
});

const isDirty = computed(
  () =>
    draftDisplayName.value !== sleeperStore.displayName ||
    draftAiProvider.value !== sleeperStore.aiProvider ||
    draftApiKey.value !== sleeperStore.apiKey,
);

async function saveSleeperProfile() {
  if (isSaving.value) return;
  isSaving.value = true;
  saveBanner.value = 'idle';
  try {
    await Promise.all([
      sleeperStore.setDisplayName(draftDisplayName.value),
      sleeperStore.setAiProvider(draftAiProvider.value),
      sleeperStore.setApiKey(draftApiKey.value),
    ]);
    saveBanner.value = 'saved';
    void appendActivityLog({
      source: 'options',
      message: 'Sleeper profile saved',
      detail: `${draftDisplayName.value || '(no name)'} · ${draftAiProvider.value}`,
    });
    window.setTimeout(() => {
      if (saveBanner.value === 'saved') saveBanner.value = 'idle';
    }, 2500);
  } catch (err) {
    console.error('[Sleeper Jr Bot] Failed to save sleeper profile', err);
    saveBanner.value = 'error';
  } finally {
    isSaving.value = false;
  }
}

const featureStatusRows = computed((): FeatureStatusRow[] => [
  {
    id: 'extension',
    title: 'Extension (master)',
    detail: 'When paused, content scripts and automation stay inactive.',
    pillLabel: extensionStore.extensionEnabled ? 'Enabled' : 'Disabled',
    pillVariant: extensionStore.extensionEnabled ? 'on' : 'off',
  },
  {
    id: 'bored-class',
    title: 'BoredClass Sleeper',
    detail: 'Coursera assistant panel; AI needs a saved API key.',
    pillLabel: sleeperStore.boredClassEnabled ? 'Enabled' : 'Disabled',
    pillVariant: sleeperStore.boredClassEnabled ? 'on' : 'off',
  },
  {
    id: 'file-cleaner',
    title: 'FileCleaner',
    detail: 'PDF metadata — pick a file locally, preview properties, strip and download (no toggle).',
    pillLabel: 'Local tool',
    pillVariant: 'neutral',
  },
  {
    id: 'ai',
    title: 'AI credentials',
    detail: `${sleeperStore.aiProvider} — stored locally only.`,
    pillLabel: sleeperStore.apiKey.trim() ? 'API key on file' : 'No API key',
    pillVariant: sleeperStore.apiKey.trim() ? 'on' : 'neutral',
  },
  {
    id: 'present-teacher',
    title: 'Present teacher!',
    detail: 'Camera and speech for live classes — not in this build.',
    pillLabel: 'Planned',
    pillVariant: 'planned',
  },
]);
</script>

<template>
  <div class="home">
    <BrandHeader
      variant="options"
      lead="Coursera assistant (BoredClass Sleeper): list course videos, AI help for quizzes and assignment drafts."
    />

    <PageSection title="Sleeper profile" title-id="sleeper-heading">
      <SurfaceCard variant="form">
        <FormField label="Display name" label-for="opt-display-name">
          <TextInput id="opt-display-name" v-model="draftDisplayName" autocomplete="nickname" />
        </FormField>

        <FormField label="AI provider">
          <ProviderSelect v-model="draftAiProvider" :options="providerOptions" />
        </FormField>

        <FormField label="API key">
          <ApiKeyInput v-model="draftApiKey" input-id="sleeper-api-key">
            <template #hint>
              Click <strong>Save</strong> to store profile fields (
              <code>chrome.storage.local</code>). Feature toggles below save immediately.
            </template>
          </ApiKeyInput>
        </FormField>

        <SaveBar
          :saving="isSaving"
          :disabled="!isDirty"
          :banner="saveBanner"
          @save="saveSleeperProfile"
        />

        <p class="home__note">
          AI runs in the extension background with your provider and key. Review outputs before submitting graded work.
        </p>
      </SurfaceCard>
    </PageSection>

    <PageSection
      title="Feature toggles"
      title-id="feature-toggles-heading"
      description="These switches write to storage as soon as you change them (no Save)."
    >
      <SurfaceCard variant="toggles">
        <ToggleRow
          v-model="extensionEnabledModel"
          title="Extension (master)"
          hint="Pauses the whole extension, including Coursera scripts."
          label-on="On"
          label-off="Paused"
        />
        <ToggleRow
          v-model="boredClassEnabledModel"
          title="BoredClass Sleeper"
          hint="Floating panel and AI actions on Coursera (needs extension on)."
          label-on="On"
          label-off="Off"
        />
      </SurfaceCard>
    </PageSection>

    <PageSection
      title="FileCleaner — strip PDF metadata"
      title-id="file-cleaner-heading"
      description="Choose a PDF from your computer. It is kept in memory only: preview properties, strip metadata, then download a new file. Nothing is uploaded."
    >
      <SurfaceCard variant="form">
        <FileCleanerPanel />
      </SurfaceCard>
    </PageSection>

    <PageSection
      title="Feature status"
      title-id="feature-status-heading"
      description="Toggles update live. Name, provider, and API key reflect the last profile Save."
    >
      <FeatureStatusBoard :rows="featureStatusRows" />
    </PageSection>
  </div>
</template>

<style scoped>
.home {
  max-width: 52rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.home__note {
  margin: 0;
  font-size: 0.72rem;
  color: var(--ij-muted);
  line-height: 1.45;
}
</style>
