<script lang="ts" setup>
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost';
    type?: 'button' | 'submit';
    disabled?: boolean;
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
);

const emit = defineEmits<{ click: [e: MouseEvent] }>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['ui-btn', `ui-btn--${variant}`]"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  border: none;
  border-radius: 0.55rem;
  padding: 0.55rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease;
}

.ui-btn--primary {
  color: #0f172a;
  background: linear-gradient(180deg, color-mix(in srgb, var(--ij-accent) 92%, white), var(--ij-accent));
}

.ui-btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

.ui-btn--primary:active:not(:disabled) {
  transform: scale(0.98);
}

.ui-btn--ghost {
  color: var(--ij-text);
  background: transparent;
  border: 1px solid var(--ij-border);
}

.ui-btn--ghost:hover:not(:disabled) {
  filter: none;
  background: color-mix(in srgb, #fff 6%, transparent);
  border-color: color-mix(in srgb, var(--ij-accent) 35%, var(--ij-border));
}

.ui-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
