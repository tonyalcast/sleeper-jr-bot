<script lang="ts" setup>
defineProps<{
  saving: boolean;
  disabled: boolean;
  banner: 'idle' | 'saved' | 'error';
}>();

const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div class="ui-save">
    <button
      type="button"
      class="ui-save__btn"
      :disabled="disabled || saving"
      @click="emit('save')"
    >
      {{ saving ? 'Saving…' : 'Save' }}
    </button>
    <p v-if="banner === 'saved'" class="ui-save__msg ui-save__msg--ok" role="status">Saved.</p>
    <p v-else-if="banner === 'error'" class="ui-save__msg ui-save__msg--err" role="alert">
      Could not save. Try again.
    </p>
  </div>
</template>

<style scoped>
.ui-save {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.15rem;
}

.ui-save__btn {
  border: none;
  border-radius: 0.55rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  color: #0f172a;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--ij-accent) 92%, white),
    var(--ij-accent)
  );
  cursor: pointer;
  transition: opacity 0.12s ease, filter 0.12s ease;
}

.ui-save__btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.ui-save__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ui-save__msg {
  margin: 0;
  font-size: 0.78rem;
}

.ui-save__msg--ok {
  color: color-mix(in srgb, var(--ij-accent) 80%, var(--ij-text));
}

.ui-save__msg--err {
  color: color-mix(in srgb, var(--ij-warn) 85%, #b91c1c);
}
</style>
