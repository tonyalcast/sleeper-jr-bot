<script lang="ts" setup>
import type { StatusPillVariant } from '@/components/ui/types';

defineProps<{
  label: string;
  variant: StatusPillVariant;
}>();
</script>

<template>
  <span
    class="ui-pill"
    :data-variant="variant"
    :aria-label="`Status: ${label}`"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.ui-pill {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--ij-border);
  background: var(--ij-bg-elevated);
  color: var(--ij-muted);
}

.ui-pill[data-variant='on'] {
  color: color-mix(in srgb, var(--ij-accent) 85%, #0f172a);
  border-color: color-mix(in srgb, var(--ij-accent) 40%, transparent);
  background: color-mix(in srgb, var(--ij-accent) 12%, var(--ij-bg-elevated));
}

.ui-pill[data-variant='off'] {
  color: var(--ij-muted);
}

.ui-pill[data-variant='neutral'] {
  color: color-mix(in srgb, var(--ij-muted) 90%, var(--ij-text));
}

.ui-pill[data-variant='planned'] {
  color: color-mix(in srgb, var(--ij-warn) 90%, var(--ij-text));
  border-color: color-mix(in srgb, var(--ij-warn) 28%, transparent);
  background: color-mix(in srgb, var(--ij-warn) 10%, var(--ij-bg-elevated));
}
</style>
