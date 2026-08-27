<script setup lang="ts">
withDefaults(defineProps<{ caption: string; compact?: boolean }>(), { compact: false });
</script>

<template>
  <div class="df-compatibility-table" :class="{ 'df-compatibility-table--compact': compact }">
    <table>
      <caption>{{ caption }}</caption>
      <slot />
    </table>
  </div>
</template>
