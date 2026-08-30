# Documentation platform components

- Status: Implemented
- Owner: Documentation maintainers
- Last verified: 2026-08-27
- Applies to: VitePress documentation platform

This page is the build, accessibility, and visual-regression fixture for reusable
documentation components.

## Maturity badges

<p>
  <MaturityBadge status="implemented" />
  <MaturityBadge status="documented" />
  <MaturityBadge status="experimental" />
  <MaturityBadge status="compatibility-only" />
  <MaturityBadge status="placeholder" />
  <MaturityBadge status="planned" />
</p>

## Framework availability

<FrameworkAvailability
  core="available"
  react="available"
  react-html="available"
  native-html="planned"
  angular="experimental"
  angular-html="experimental"
/>

## Installation block

<InstallBlock packages="@dynamic-form-engine/core @dynamic-form-engine/react @dynamic-form-engine/react-html react react-dom" />

## Framework tabs

<FrameworkTabs initial="react-html">
  <template #native-html>Standalone Native HTML/DOM rendering is planned; no installation API exists.</template>
  <template #react-html>React HTML is the complete documented browser-native renderer.</template>
  <template #angular-html>Angular HTML is an Experimental Angular 22 renderer with a 15-type baseline.</template>
</FrameworkTabs>

## Compatibility table

<CompatibilityTable caption="Renderer availability" compact>
  <thead><tr><th scope="col">Renderer</th><th scope="col">Status</th></tr></thead>
  <tbody>
    <tr><th scope="row">React HTML</th><td>Documented</td></tr>
    <tr><th scope="row">Angular HTML</th><td>Experimental</td></tr>
    <tr><th scope="row">Standalone Native HTML/DOM</th><td>Planned</td></tr>
  </tbody>
</CompatibilityTable>

## Example container

<DocsExample title="Verified schema behavior">
  <template #preview>The preview slot contains the rendered or interactive result.</template>
  The default slot contains source, explanation, or a verified snippet.
</DocsExample>

## Component rules

- Components retain semantic HTML and textual status.
- Interactive tabs expose tab, tablist, and tabpanel semantics.
- Experimental integrations state limitations beside executable instructions.
- Planned integrations never receive executable installation instructions.
- Components remain usable in dark mode, forced-colors mode, zoom, and narrow layouts.
