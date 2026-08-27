import { mkdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..', '..', '..');
const output = resolve(import.meta.dirname, '..', 'public', 'examples');
mkdirSync(output, { recursive: true });
const server = spawn('pnpm --filter @dynamic-forms/react-html-playground dev --host 127.0.0.1 --port 4185', [], {
  cwd: root, stdio: 'ignore', shell: true, windowsHide: true,
});

async function ready() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch('http://127.0.0.1:4185/?example=basic-form')).ok) return; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error('React HTML playground did not become ready for screenshot capture');
}

try {
  await ready();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'light' });
  for (const id of ['basic-form', 'validation-errors', 'enterprise-profile']) {
    await page.goto(`http://127.0.0.1:4185/?example=${id}`, { waitUntil: 'networkidle' });
    if (id === 'validation-errors') await page.getByRole('button', { name: 'Validate' }).click();
    await page.screenshot({ path: resolve(output, `${id}.png`), fullPage: true, animations: 'disabled' });
  }
  await browser.close();
  console.log('Captured 3 deterministic example screenshots.');
} finally {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else server.kill('SIGTERM');
}
