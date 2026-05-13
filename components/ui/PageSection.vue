<script lang="ts" setup>
defineProps<{
  title: string;
  titleId: string;
  description?: string;
}>();
</script>

<template>
  <section class="ui-section" :aria-labelledby="titleId">
    <h2 :id="titleId" class="ui-section__title">{{ title }}</h2>
    <p v-if="description" class="ui-section__desc">{{ description }}</p>
    <slot />
  </section>
</template>

<style scoped>
.ui-section {
  margin-bottom: 1.75rem;
}

.ui-section__title {
  margin: 0 0 1rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ij-muted);
}

.ui-section__desc {
  margin: -0.35rem 0 1rem;
  font-size: 0.82rem;
  color: var(--ij-muted);
  line-height: 1.5;
  max-width: 40rem;
}
</style>
