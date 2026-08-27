<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  packages: string;
  dev?: boolean;
}>(), { dev: false });

type Manager = 'pnpm' | 'npm' | 'yarn';
const manager = ref<Manager>('pnpm');
const commands = computed<Record<Manager, string>>(() => ({
  pnpm: `pnpm add${props.dev ? ' -D' : ''} ${props.packages}`,
  npm: `npm install${props.dev ? ' --save-dev' : ''} ${props.packages}`,
  yarn: `yarn add${props.dev ? ' --dev' : ''} ${props.packages}`,
}));
</script>

<template>
  <section class="df-install-block" aria-label="Package installation command">
    <div role="tablist" aria-label="Package manager">
      <button
        v-for="candidate in (['pnpm', 'npm', 'yarn'] as Manager[])"
        :key="candidate"
        type="button"
        role="tab"
        :aria-selected="manager === candidate"
        :tabindex="manager === candidate ? 0 : -1"
        @click="manager = candidate"
      >
        {{ candidate }}
      </button>
    </div>
    <pre><code>{{ commands[manager] }}</code></pre>
  </section>
</template>
