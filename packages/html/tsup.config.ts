import { defineConfig } from 'tsup';
export default defineConfig({
  entry: { index: 'src/index.ts', styles: 'src/styles/default.css' },
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom', '@dynamic-forms/core', '@dynamic-forms/react'],
});
