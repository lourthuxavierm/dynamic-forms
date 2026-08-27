<script setup lang="ts">
type Availability = 'available' | 'experimental' | 'compatibility-only' | 'planned' | 'not-applicable';

defineProps<{
  core?: Availability;
  nativeHtml?: Availability;
  react?: Availability;
  reactHtml?: Availability;
  angular?: Availability;
  angularHtml?: Availability;
}>();

const labels: Record<Availability, string> = {
  available: 'Available',
  experimental: 'Experimental',
  'compatibility-only': 'Compatibility only',
  planned: 'Planned',
  'not-applicable': 'Not applicable',
};
</script>

<template>
  <dl class="df-framework-availability" aria-label="Framework availability">
    <template v-for="entry in [
      ['Core', core],
      ['Native HTML', nativeHtml],
      ['React', react],
      ['React HTML', reactHtml],
      ['Angular', angular],
      ['Angular HTML', angularHtml],
    ]" :key="entry[0]">
      <div v-if="entry[1]" class="df-framework-availability__item">
        <dt>{{ entry[0] }}</dt>
        <dd :data-status="entry[1]">{{ labels[entry[1] as Availability] }}</dd>
      </div>
    </template>
  </dl>
</template>
