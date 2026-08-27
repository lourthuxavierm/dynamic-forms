import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: { mainFields: ['module'] },
  plugins: [angular({ tsconfig: 'tsconfig.app.json' })],
});
