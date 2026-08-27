<script setup lang="ts">
withDefaults(defineProps<{ title: string; status?: string }>(), { status: 'Verified example' });
</script>

<template>
  <section class="df-docs-example" :aria-label="title">
    <header>
      <strong>{{ title }}</strong>
      <span>{{ status }}</span>
    </header>
    <div class="df-docs-example__preview"><slot name="preview" /></div>
    <div class="df-docs-example__source"><slot /></div>
  </section>
</template>
