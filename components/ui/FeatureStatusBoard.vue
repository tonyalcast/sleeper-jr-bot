<script lang="ts" setup>
import type { FeatureStatusRow } from '@/components/ui/types';
import StatusPill from './StatusPill.vue';

defineProps<{
  rows: FeatureStatusRow[];
}>();
</script>

<template>
  <ul class="ui-board" role="list">
    <li v-for="row in rows" :key="row.id" class="ui-board__card">
      <div class="ui-board__head">
        <span class="ui-board__title">{{ row.title }}</span>
        <StatusPill :label="row.pillLabel" :variant="row.pillVariant" />
      </div>
      <p class="ui-board__detail">{{ row.detail }}</p>
    </li>
  </ul>
</template>

<style scoped>
.ui-board {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

@media (min-width: 640px) {
  .ui-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

.ui-board__card {
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: var(--ij-surface);
  border: 1px solid var(--ij-border);
}

.ui-board__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0.35rem;
}

.ui-board__title {
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--ij-text);
  line-height: 1.25;
}

.ui-board__detail {
  margin: 0;
  font-size: 0.74rem;
  color: var(--ij-muted);
  line-height: 1.45;
}
</style>
