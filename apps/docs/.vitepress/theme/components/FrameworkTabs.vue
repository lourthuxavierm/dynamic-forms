<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';

type Framework = 'native-html' | 'react-html' | 'angular-html';

const props = withDefaults(defineProps<{
  label?: string;
  initial?: Framework;
}>(), {
  label: 'Framework examples',
  initial: 'react-html',
});

const slots = useSlots();
const frameworks: readonly { id: Framework; label: string }[] = [
  { id: 'native-html', label: 'Native HTML' },
  { id: 'react-html', label: 'React HTML' },
  { id: 'angular-html', label: 'Angular HTML' },
];
const available = computed(() => frameworks.filter(({ id }) => Boolean(slots[id])));
const selected = ref<Framework>(props.initial);
const active = computed(() => available.value.some(({ id }) => id === selected.value) ? selected.value : available.value[0]?.id);
</script>

<template>
  <section class="df-framework-tabs" :aria-label="label">
    <div role="tablist" :aria-label="label">
      <button
        v-for="framework in available"
        :id="`df-framework-${framework.id}-tab`"
        :key="framework.id"
        type="button"
        role="tab"
        :aria-selected="active === framework.id"
        :aria-controls="`df-framework-${framework.id}-panel`"
        :tabindex="active === framework.id ? 0 : -1"
        @click="selected = framework.id"
      >
        {{ framework.label }}
      </button>
    </div>
    <div
      v-for="framework in available"
      v-show="active === framework.id"
      :id="`df-framework-${framework.id}-panel`"
      :key="`${framework.id}-panel`"
      role="tabpanel"
      :aria-labelledby="`df-framework-${framework.id}-tab`"
    >
      <slot :name="framework.id" />
    </div>
  </section>
</template>
