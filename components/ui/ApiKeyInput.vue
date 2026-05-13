<script lang="ts" setup>
import { ref } from 'vue';

const model = defineModel<string>({ required: true });

withDefaults(
  defineProps<{
    inputId?: string;
    placeholder?: string;
  }>(),
  { inputId: 'ui-api-key', placeholder: 'sk-…' },
);

const visible = ref(false);
</script>

<template>
  <div class="ui-api">
    <div class="ui-api__row">
      <input
        :id="inputId"
        v-model="model"
        :type="visible ? 'text' : 'password'"
        class="ui-api__input"
        autocomplete="off"
        :placeholder="placeholder"
      />
      <button
        type="button"
        class="ui-api__toggle"
        :aria-pressed="visible"
        :aria-label="visible ? 'Hide API key' : 'Show API key'"
        @click="visible = !visible"
      >
        <svg
          v-if="!visible"
          class="ui-api__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          class="ui-api__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      </button>
    </div>
    <p v-if="$slots.hint" class="ui-api__hint">
      <slot name="hint" />
    </p>
  </div>
</template>

<style scoped>
.ui-api__row {
  display: flex;
  align-items: stretch;
  border-radius: 0.55rem;
  border: 1px solid var(--ij-border);
  background: var(--ij-bg-elevated);
  overflow: hidden;
}

.ui-api__input {
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 0;
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--ij-text);
  background: transparent;
}

.ui-api__input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ij-accent) 45%, transparent);
}

.ui-api__toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.65rem;
  border: none;
  background: transparent;
  color: var(--ij-muted);
  cursor: pointer;
  line-height: 0;
  transition: color 0.12s ease, background 0.12s ease;
}

.ui-api__toggle:hover {
  color: var(--ij-text);
  background: color-mix(in srgb, #fff 6%, transparent);
}

.ui-api__icon {
  width: 1.15rem;
  height: 1.15rem;
}

.ui-api__hint {
  margin: 0;
  font-size: 0.68rem;
  color: var(--ij-muted);
  line-height: 1.35;
}

.ui-api__hint :deep(strong) {
  font-weight: 600;
}

.ui-api__hint :deep(code) {
  font-size: 0.85em;
  padding: 0.08em 0.3em;
  border-radius: 0.25rem;
  background: var(--ij-bg-elevated);
  border: 1px solid var(--ij-border);
  font-family: ui-monospace, monospace;
}
</style>
