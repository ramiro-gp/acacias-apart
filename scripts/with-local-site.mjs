import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const [mode, task, ...taskArgs] = process.argv.slice(2);
if (!['dev', 'preview'].includes(mode) || !task) {
  throw new Error('Uso: node scripts/with-local-site.mjs dev|preview <script> [argumentos...]');
}

const require = createRequire(import.meta.url);
const astroCli = path.join(path.dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');
const port = process.env.QA_PORT || '4319';
const url = `http://127.0.0.1:${port}/`;
const server = spawn(process.execPath, [astroCli, mode, '--host', '127.0.0.1', '--port', port], {
  stdio: 'ignore',
  env: process.env,
});
let serverExit;
server.once('exit', (code, signal) => { serverExit = { code, signal }; });

async function waitForSite() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (serverExit) throw new Error(`Astro ${mode} se cerró antes de servir: ${JSON.stringify(serverExit)}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch { /* Wait for Astro to become ready. */ }
    await delay(250);
  }
  throw new Error(`Astro ${mode} no respondió en ${url}`);
}

let exitCode = 1;
try {
  await waitForSite();
  const env = { ...process.env, QA_URL: url, QA_ENV: mode === 'dev' ? 'development' : 'production' };
  const child = spawn(process.execPath, [task, ...taskArgs], { stdio: 'inherit', env });
  exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolve(code ?? 1));
  });
} finally {
  server.kill();
  await Promise.race([
    new Promise(resolve => server.once('exit', resolve)),
    delay(3000),
  ]);
}
process.exitCode = exitCode;
