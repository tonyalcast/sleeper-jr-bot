<script lang="ts" setup>
const model = defineModel<string>({ required: true });

defineProps<{
  id?: string;
  autocomplete?: string;
  placeholder?: string;
}>();
</script>

<template>
  <input
    v-model="model"
    type="text"
    class="ui-input"
    :id="id"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
  />
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
