import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    basic: 'src/basic.ts',
    validation: 'src/validation.ts',
    conditions: 'src/conditions.ts',
    dependencies: 'src/dependencies.ts',
    wizard: 'src/wizard.ts',
    dataSources: 'src/dataSources.ts',
    nestedArrays: 'src/nestedArrays.ts',
    permissions: 'src/permissions.ts',
    layouts: 'src/layouts.ts',
    enterprise: 'src/enterprise.ts',
  },
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  external: ['@dynamic-forms/core'],
});
