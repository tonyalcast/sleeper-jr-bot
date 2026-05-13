<script lang="ts" setup>
defineProps<{
  label: string;
  labelFor?: string;
}>();
</script>

<template>
  <component
    :is="labelFor ? 'label' : 'div'"
    class="ui-field"
    :for="labelFor"
  >
    <span class="ui-field__label">{{ label }}</span>
    <slot />
  </component>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ui-field__label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ij-muted);
}
</style>
