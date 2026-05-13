<script lang="ts" setup>
import { computed } from 'vue';
import { browser } from 'wxt/browser';

withDefaults(
  defineProps<{
    variant: 'options' | 'popup';
    title?: string;
    lead?: string;
  }>(),
  { title: 'Sleeper Jr Bot' },
);

const logoUrl = computed(() => browser.runtime.getURL('/icon/128.png'));
</script>

<template>
  <header :class="['ui-brand', `ui-brand--${variant}`]">
    <div
      class="ui-brand__logo-wrap"
      :class="variant === 'options' ? 'ui-brand__logo-wrap--options' : 'ui-brand__logo-wrap--popup'"
    >
      <img class="ui-brand__logo" :src="logoUrl" alt="" width="128" height="128" decoding="async" />
    </div>
    <div class="ui-brand__text">
      <h1 class="ui-brand__title">{{ title }}</h1>
      <p v-if="variant === 'options' && lead" class="ui-brand__lead">{{ lead }}</p>
      <div v-else class="ui-brand__subtitle-wrap">
        <slot name="subtitle" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.ui-brand {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ui-brand--options {
  margin-bottom: 2.25rem;
  gap: 1rem;
}

.ui-brand__logo-wrap {
  flex-shrink: 0;
  border-radius: 0.85rem;
  overflow: hidden;
  box-shadow: 0 8px 28px color-mix(in srgb, var(--ij-accent) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--ij-border) 80%, transparent);
  background: color-mix(in srgb, var(--ij-surface) 40%, transparent);
}

.ui-brand__logo-wrap--options {
  width: 3rem;
  height: 3rem;
}

.ui-brand__logo-wrap--popup {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.65rem;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--ij-accent) 25%, transparent);
}

.ui-brand__logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-brand__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--ij-text);
}

.ui-brand--options .ui-brand__title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.ui-brand__lead {
  margin: 0.45rem 0 0;
  font-size: 0.95rem;
  color: var(--ij-muted);
  max-width: 36rem;
  line-height: 1.5;
}

.ui-brand__subtitle-wrap :deep(p) {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: var(--ij-muted);
  line-height: 1.35;
}
</style>
