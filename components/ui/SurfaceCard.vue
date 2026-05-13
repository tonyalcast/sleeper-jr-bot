<script lang="ts" setup>
withDefaults(
  defineProps<{
    /** form = sleeper fields; toggles = feature switches; panel = padding only */
    variant?: 'panel' | 'form' | 'toggles';
  }>(),
  { variant: 'panel' },
);
</script>

<template>
  <div :class="['ui-card', `ui-card--${variant}`]">
    <slot />
  </div>
</template>

<style scoped>
.ui-card {
  padding: 1rem 1.1rem;
  border-radius: 0.85rem;
  background: var(--ij-surface);
  border: 1px solid var(--ij-border);
}

.ui-card--form,
.ui-card--toggles {
  display: flex;
  flex-direction: column;
}

.ui-card--form {
  gap: 0.75rem;
}

.ui-card--toggles {
  gap: 0.85rem;
}
</style>
