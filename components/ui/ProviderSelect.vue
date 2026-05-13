<script lang="ts" setup>
import type { AiProviderId } from '@/utils/messages';

const model = defineModel<AiProviderId>({ required: true });

defineProps<{
  options: { value: AiProviderId; label: string }[];
}>();
</script>

<template>
  <select v-model="model" class="ui-input">
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.ui-input {
  border-radius: 0.55rem;
  border: 1px solid var(--ij-border);
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--ij-text);
  background: var(--ij-bg-elevated);
}
</style>
