import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [react, reactTypes, reactDomTypes, rhf] = process.argv.slice(2);
for (const [name, version] of Object.entries({ react, reactTypes, reactDomTypes, rhf })) {
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) throw new Error(`Invalid ${name} compatibility version: ${version ?? '<missing>'}`);
}

function update(relativePath, updates) {
  const path = resolve(relativePath);
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  manifest.devDependencies = { ...manifest.devDependencies, ...updates };
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

const reactDependencies = {
  react,
  'react-dom': react,
  '@types/react': reactTypes,
  '@types/react-dom': reactDomTypes,
};
const rootPath = resolve('package.json');
const root = JSON.parse(readFileSync(rootPath, 'utf8'));
root.devDependencies = { ...root.devDependencies, ...reactDependencies };
root.pnpm = {
  ...root.pnpm,
  overrides: {
    ...root.pnpm?.overrides,
    react,
    'react-dom': react,
    '@types/react': reactTypes,
    '@types/react-dom': reactDomTypes,
    'react-hook-form': rhf,
  },
};
writeFileSync(rootPath, `${JSON.stringify(root, null, 2)}\n`);
update('packages/react/package.json', reactDependencies);
update('packages/rhf/package.json', { ...reactDependencies, 'react-hook-form': rhf });
console.log(`Configured React ${react}, React types ${reactTypes}/${reactDomTypes}, and RHF ${rhf}.`);
