import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({ plugins: [react()], resolve: { alias: { '@dynamic-forms/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)) } }, test: { environment: 'happy-dom', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] } });
