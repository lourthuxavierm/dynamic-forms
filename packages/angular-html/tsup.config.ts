import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'], format: ['esm', 'cjs'], dts: false, sourcemap: true,
  clean: true, treeshake: true, target: 'es2022',
  external: ['@angular/common', '@angular/core', '@angular/forms', '@lourthuxavierm/dynamic-forms-angular', '@lourthuxavierm/dynamic-forms-core'],
});
