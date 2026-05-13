<script lang="ts" setup>
const checked = defineModel<boolean>({ required: true });

withDefaults(
  defineProps<{
    title: string;
    hint?: string;
    labelOn: string;
    labelOff: string;
    /** options = bordered rows; compact = popup row */
    density?: 'options' | 'compact';
    bordered?: boolean;
  }>(),
  { density: 'options', bordered: true },
);
</script>

<template>
  <div :class="['ui-toggle', density === 'compact' && 'ui-toggle--compact', bordered && 'ui-toggle--bordered']">
    <div class="ui-toggle__text">
      <span class="ui-toggle__title">{{ title }}</span>
      <span v-if="hint" class="ui-toggle__hint">{{ hint }}</span>
    </div>
    <label class="ui-toggle__control">
      <input v-model="checked" type="checkbox" class="ui-toggle__input" />
      <span class="ui-toggle__state">{{ checked ? labelOn : labelOff }}</span>
    </label>
  </div>
</template>

<style scoped>
.ui-toggle {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
}

.ui-toggle--bordered:not(:last-child) {
  border-bottom: 1px solid var(--ij-border);
}

.ui-toggle--bordered:last-child {
  padding-bottom: 0;
}

.ui-toggle--compact {
  align-items: center;
  padding: 0;
  border: none;
}

.ui-toggle__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.ui-toggle__title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ij-text);
}

.ui-toggle--compact .ui-toggle__title {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ij-muted);
}

.ui-toggle__hint {
  font-size: 0.72rem;
  color: var(--ij-muted);
  line-height: 1.35;
}

.ui-toggle__control {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--ij-text);
  user-select: none;
}

.ui-toggle__input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--ij-accent);
  cursor: pointer;
}

.ui-toggle__state {
  min-width: 3.25rem;
  font-weight: 500;
}

.ui-toggle--compact .ui-toggle__state {
  min-width: 3.5rem;
}
</style>
