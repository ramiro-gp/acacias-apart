import { readFile, access, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';

const resources = JSON.parse(await readFile('docs/audit/resources.json', 'utf8'));
let archivedResourcesVerified = 0;
let workingPhotosVerified = 0;
let userProvidedPhotosVerified = 0;
try {
  await access('docs/source/original-assets');
  for (const asset of resources.assets) {
    const bytes = await readFile(asset.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Original modificado: ${asset.file}`);
    archivedResourcesVerified++;
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  // The archival mirror is intentionally kept outside Git; check all build inputs instead.
  for (const asset of resources.assets.filter(record => record.workingFile)) {
    const bytes = await readFile(asset.workingFile);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Foto de trabajo modificada: ${asset.workingFile}`);
    workingPhotosVerified++;
  }
}
for (const asset of resources.userProvidedUpdates?.assets ?? []) {
  for (const file of [asset.file, asset.workingFile]) {
    const bytes = await readFile(file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Foto aportada modificada: ${file}`);
  }
  userProvidedPhotosVerified++;
}
if (resources.sourceHtml) {
  const bytes = await readFile(resources.sourceHtml.file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), resources.sourceHtml.sha256, 'HTML original modificado');
}
const { records } = JSON.parse(await readFile('docs/portfolio/screenshots/before-manifest.json', 'utf8'));
assert.equal(records.length, 4, 'Faltan capturas ANTES');
for (const record of records) {
  const bytes = await readFile(path.join('docs/portfolio/screenshots', record.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `Captura modificada: ${record.file}`);
  if (!record.fullPage) assert.deepEqual(record.imageDimensions, record.viewport);
}
try {
  const after = JSON.parse(await readFile('docs/portfolio/screenshots/after-manifest.json', 'utf8'));
  assert.equal(after.records.length, 4, 'Faltan capturas DESPUÉS');
  for (const record of after.records) {
    const bytes = await readFile(path.join('docs/portfolio/screenshots', record.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `Captura modificada: ${record.file}`);
    if (!record.fullPage) assert.deepEqual(record.imageDimensions, record.viewport);
    const original = records.find(before => before.file === record.file.replace('after-', 'before-'));
    assert.equal(record.browser, original.browser, 'Cambió el navegador de las capturas comparables');
    assert.equal(record.playwrightVersion, original.playwrightVersion);
    assert.deepEqual(record.viewport, original.viewport);
    assert.equal(record.deviceScaleFactor, original.deviceScaleFactor);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(item)); else result.push(item);
  }
  return result;
}
try {
  await access('dist');
  for (const file of await files('dist')) {
    assert(!/(?:before-|after-|proposal-|manifest\.json|original-assets|\.md$|\.map$)/i.test(file), `Archivo privado en dist: ${file}`);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log(`Preservación verificada: ${archivedResourcesVerified ? `${archivedResourcesVerified} originales archivados` : `${workingPhotosVerified} fotos de compilación`}, ${userProvidedPhotosVerified} fotos nuevas archivadas y de trabajo, 4 capturas ANTES y exclusión del bundle.`);
