<script setup lang="ts">
import { computed } from 'vue';

type Maturity =
  | 'placeholder'
  | 'planned'
  | 'experimental'
  | 'implemented'
  | 'documented'
  | 'compatibility-only'
  | 'release-ready';

const props = defineProps<{ status: Maturity; label?: string }>();
const displayLabel = computed(() => props.label ?? props.status.replace(/(^|-)(\w)/g, (_match, separator, letter: string) => `${separator ? ' ' : ''}${letter.toUpperCase()}`));
</script>

<template>
  <span class="df-maturity-badge" :data-status="status">{{ displayLabel }}</span>
</template>
