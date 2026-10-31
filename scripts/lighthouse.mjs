import { chromium } from './browser-runtime.mjs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const cli = require.resolve('lighthouse/cli/index.js');
const url = process.env.QA_URL || 'http://127.0.0.1:4321/';
const runs = [];
await mkdir('docs/qa/lighthouse', { recursive: true });
for (const profile of ['mobile', 'desktop']) {
  for (let run = 1; run <= 3; run++) {
    const output = `docs/qa/lighthouse/${profile}-${run}.json`;
    const args = [cli, url, '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new', '--output=json', `--output-path=${output}`, '--quiet'];
    if (profile === 'desktop') args.push('--preset=desktop');
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, CHROME_PATH: chromium.executablePath() } });
      let errors = ''; child.stderr.on('data', data => { errors += data; });
      child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(errors)));
    });
    const lhr = JSON.parse(await readFile(output, 'utf8'));
    if (lhr.runtimeError) throw new Error(JSON.stringify(lhr.runtimeError));
    const result = { profile, run, version: lhr.lighthouseVersion, date: lhr.fetchTime, scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])), lcpMs: lhr.audits['largest-contentful-paint'].numericValue, cls: lhr.audits['cumulative-layout-shift'].numericValue, tbtMs: lhr.audits['total-blocking-time'].numericValue, output, settings: lhr.configSettings };
    runs.push(result); console.log(JSON.stringify({ profile, run, scores: result.scores, lcpMs: Math.round(result.lcpMs), cls: result.cls }));
  }
}
const median = values => [...values].sort((a,b) => a-b)[1];
const medians = Object.fromEntries(['mobile','desktop'].map(profile => { const group = runs.filter(run => run.profile === profile); return [profile, { scores: Object.fromEntries(['performance','accessibility','best-practices','seo'].map(key => [key, median(group.map(run => run.scores[key]))])), lcpMs: median(group.map(run => run.lcpMs)), cls: median(group.map(run => run.cls)) }]; }));
await writeFile('docs/qa/lighthouse-summary.json', JSON.stringify({ date: new Date().toISOString(), url, note: 'Laboratorio local, build estático de release. No mide tráfico real ni el hosting de producción.', runs, medians }, null, 2) + '\n');
assert(runs.every(run => run.scores.seo === 100), 'SEO no alcanzó 100 en todas las corridas; revisar informes.');
assert(Object.values(medians).every(result => result.scores.performance >= 90), 'Rendimiento mediano inferior a 90; revisar informes.');
