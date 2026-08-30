import { defineConfig } from 'tsup';
export default defineConfig({
  entry: {
    index: 'src/index.ts', core: 'src/entries/core.ts', baseline: 'src/entries/baseline.ts',
    text: 'src/entries/text.ts', composites: 'src/entries/composites.ts',
    specialized: 'src/entries/specialized.ts', temporal: 'src/entries/temporal.ts',
    media: 'src/entries/media.ts', styles: 'src/styles/default.css',
  },
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom', '@lourthuxavierm/dynamic-forms-core', '@lourthuxavierm/dynamic-forms-react'],
});
