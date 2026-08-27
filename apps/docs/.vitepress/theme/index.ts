import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import CompatibilityTable from './components/CompatibilityTable.vue';
import DocsExample from './components/DocsExample.vue';
import FrameworkAvailability from './components/FrameworkAvailability.vue';
import FrameworkTabs from './components/FrameworkTabs.vue';
import InstallBlock from './components/InstallBlock.vue';
import MaturityBadge from './components/MaturityBadge.vue';
import './platform.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CompatibilityTable', CompatibilityTable);
    app.component('DocsExample', DocsExample);
    app.component('FrameworkAvailability', FrameworkAvailability);
    app.component('FrameworkTabs', FrameworkTabs);
    app.component('InstallBlock', InstallBlock);
    app.component('MaturityBadge', MaturityBadge);
  },
} satisfies Theme;
