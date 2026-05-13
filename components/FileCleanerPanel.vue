<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Button } from '@/components/ui';
import { appendActivityLog } from '@/utils/activity-log';
import {
  buildStrippedDownloadName,
  downloadPdfBytes,
  PdfMetadataError,
  readPdfMetadata,
  stripPdfMetadata,
  type PdfStandardMetadata,
} from '@/utils/pdf-metadata';

const props = withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  { compact: false },
);

const fileInputRef = ref<HTMLInputElement | null>(null);
const fileName = ref('');
const rawBytes = ref<Uint8Array | null>(null);
const metadata = ref<PdfStandardMetadata | null>(null);
const statusError = ref('');
const busy = ref(false);

const metaRows = computed(() => {
  const m = metadata.value;
  if (!m) return [];
  const rows: { label: string; value: string }[] = [
    { label: 'Title', value: m.title ?? '' },
    { label: 'Author', value: m.author ?? '' },
    { label: 'Subject', value: m.subject ?? '' },
    { label: 'Keywords', value: m.keywords ?? '' },
    { label: 'Creator', value: m.creator ?? '' },
    { label: 'Producer', value: m.producer ?? '' },
    { label: 'Creation date', value: m.creationDate ?? '' },
    { label: 'Modification date', value: m.modificationDate ?? '' },
    { label: 'Language (catalog)', value: m.language ?? '' },
  ];
  if (props.compact) {
    return rows.filter((r) => r.value.trim().length > 0);
  }
  return rows;
});

const canStrip = computed(() => !!rawBytes.value && !busy.value && !metadata.value?.encrypted);

function triggerPick() {
  statusError.value = '';
  fileInputRef.value?.click();
}

async function onFilePicked(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  statusError.value = '';
  busy.value = true;
  metadata.value = null;
  rawBytes.value = null;
  fileName.value = file.name;

  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    rawBytes.value = buf;
    metadata.value = await readPdfMetadata(buf);
  } catch (err) {
    rawBytes.value = null;
    fileName.value = '';
    statusError.value =
      err instanceof PdfMetadataError ? err.message : 'Could not read this PDF.';
  } finally {
    busy.value = false;
  }
}

async function onStripAndDownload() {
  if (!rawBytes.value || !fileName.value) return;
  statusError.value = '';
  busy.value = true;
  try {
    const cleaned = await stripPdfMetadata(rawBytes.value);
    downloadPdfBytes(cleaned, buildStrippedDownloadName(fileName.value));
    void appendActivityLog({
      source: props.compact ? 'popup' : 'options',
      message: 'FileCleaner: PDF metadata stripped; download started',
      detail: fileName.value,
    });
  } catch (err) {
    statusError.value =
      err instanceof PdfMetadataError ? err.message : 'Could not strip metadata from this PDF.';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div :class="['file-cleaner', compact && 'file-cleaner--compact']">
    <input
      ref="fileInputRef"
      class="file-cleaner__input"
      type="file"
      accept="application/pdf,.pdf"
      @change="onFilePicked"
    />

    <div class="file-cleaner__actions">
      <Button variant="ghost" :disabled="busy" @click="triggerPick">
        {{ busy ? 'Working…' : 'Choose PDF…' }}
      </Button>
      <Button variant="primary" :disabled="!canStrip" @click="onStripAndDownload">
        Strip metadata &amp; download
      </Button>
    </div>

    <p v-if="fileName" class="file-cleaner__file">{{ fileName }}</p>

    <p v-if="statusError" class="file-cleaner__err">{{ statusError }}</p>

    <template v-if="metadata">
      <div v-if="metadata.hasEmbeddedXmp" class="file-cleaner__banner file-cleaner__banner--info">
        This file includes an XMP metadata stream; it will be removed when you strip.
      </div>

      <div v-if="metaRows.length === 0" class="file-cleaner__empty">
        No filled document properties (Info fields may still exist empty, or only XMP is
        present).
      </div>
      <dl v-else class="file-cleaner__list">
        <template v-for="row in metaRows" :key="row.label">
          <dt class="file-cleaner__term">{{ row.label }}</dt>
          <dd class="file-cleaner__def">{{ row.value.trim() || '—' }}</dd>
        </template>
      </dl>
    </template>

    <p v-if="!compact" class="file-cleaner__legal">
      Processing runs locally in your browser. The cleaned file is a new download; the
      original on disk is unchanged.
    </p>
  </div>
</template>

<style scoped>
.file-cleaner {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  text-align: left;
}

.file-cleaner--compact {
  gap: 0.5rem;
}

.file-cleaner__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.file-cleaner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.file-cleaner__file {
  margin: 0;
  font-size: 0.72rem;
  color: var(--ij-muted);
  word-break: break-word;
}

.file-cleaner__err {
  margin: 0;
  font-size: 0.72rem;
  color: #fca5a5;
}

.file-cleaner__banner {
  margin: 0;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.68rem;
  line-height: 1.4;
}

.file-cleaner__banner--warn {
  border: 1px solid color-mix(in srgb, #f87171 45%, var(--ij-border));
  background: color-mix(in srgb, #f87171 12%, transparent);
}

.file-cleaner__banner--info {
  border: 1px solid color-mix(in srgb, var(--ij-accent) 35%, var(--ij-border));
  background: color-mix(in srgb, var(--ij-accent) 10%, transparent);
}

.file-cleaner__empty {
  margin: 0;
  font-size: 0.7rem;
  color: var(--ij-muted);
}

.file-cleaner__list {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 8.5rem) 1fr;
  gap: 0.35rem 0.65rem;
  font-size: 0.68rem;
}

.file-cleaner--compact .file-cleaner__list {
  grid-template-columns: minmax(0, 6.75rem) 1fr;
  font-size: 0.64rem;
}

.file-cleaner__term {
  margin: 0;
  font-weight: 650;
  color: var(--ij-muted);
}

.file-cleaner__def {
  margin: 0;
  color: var(--ij-text);
  word-break: break-word;
}

.file-cleaner__legal {
  margin: 0;
  font-size: 0.65rem;
  color: var(--ij-muted);
  line-height: 1.45;
}
</style>
