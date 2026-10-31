import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import assert from 'node:assert/strict';
import path from 'node:path';
import './verify-preservation.mjs';

const hash = data => createHash('sha256').update(data).digest('hex');
const html = await readFile('dist/index.html', 'utf8');
assert(html.includes('content="index, follow"'), 'Se requiere un build:release indexable.');
assert((await readFile('dist/robots.txt', 'utf8')).includes('Allow: /'));
for (const engine of ['chromium', 'firefox', 'webkit']) {
  assert(JSON.parse(await readFile(`docs/qa/site-${engine}.json`, 'utf8')).passed, `QA pendiente: ${engine}`);
}
assert(JSON.parse(await readFile('docs/qa/edge-cases.json', 'utf8')).passed, 'QA de gestos, errores y año pendiente.');
const lighthouse = JSON.parse(await readFile('docs/qa/lighthouse-summary.json', 'utf8'));
assert(lighthouse.runs.length === 6 && lighthouse.runs.every(run => run.scores.seo === 100));
const after = JSON.parse(await readFile('docs/portfolio/screenshots/after-manifest.json', 'utf8'));
assert.equal(after.records.length, 4, 'Faltan capturas DESPUÉS.');
const originalUrls = JSON.parse(await readFile('docs/audit/urls.json', 'utf8'));
const assets = JSON.parse(await readFile('docs/audit/resources.json', 'utf8'));
const photos = new Map([...html.matchAll(/data-photo-id="([^"]+)"[^>]*>\s*<a class="photo-link" href="([^"]+)"/g)].map(match => [match[1], match[2]]));
assert.equal(photos.size, 36);
const migration = {
  date: new Date().toISOString(),
  note: 'Matriz de entrega. No se aplicaron redirecciones ni cambios al servidor. Evidencia original inmutable en urls.json/resources.json.',
  pages: originalUrls.records.map(record => ({ url: record.url, originalStatus: record.status,
    action: record.url.endsWith('.pdf') ? 'Conservada exactamente en dist/img/' : new URL(record.url).pathname === '/' ? 'Portada conservada; normalización HTTPS/www propuesta al proveedor' : 'Ver configuración de robots/sitemap y página principal en DEPLOYMENT.md' })),
  fragments: originalUrls.hashTargets.map(record => ({ id: record.id, action: 'Conservado y verificado en los tres motores; sin redirección del servidor' })),
  assets: assets.assets.map(asset => {
    const sameHost = new URL(asset.url).hostname === 'www.acaciasapart.com.ar';
    const id = asset.workingFile ? path.basename(asset.workingFile, path.extname(asset.workingFile)) : null;
    if (id && photos.has(id)) return { url: asset.url, action: 'Fotografía preservada; propuesta 301 hacia derivado local. Pendiente del proveedor.', target: new URL(photos.get(id), assets.source).href };
    return { url: asset.url, action: asset.url.endsWith('.pdf') ? 'PDF conservado exactamente' : sameHost ? 'Recurso histórico conservado en auditoría; no incluido en el nuevo bundle. Retirada de ruta pendiente al publicar.' : 'Dependencia externa retirada del render; no se controla esa URL.' };
  }),
};
await writeFile('docs/audit/url-migration.json', JSON.stringify(migration, null, 2) + '\n');

async function collect(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), 'No empaquetar enlaces simbólicos.');
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collect(file)); else result.push(file);
  }
  return result.sort();
}

// ZIP standard (deflate), implemented with Node only; no runtime or packaging dependency.
const crcTable = Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
const crc32 = bytes => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const localRecords = [], centralRecords = [], files = [];
let offset = 0;
for (const file of await collect('dist')) {
  const name = path.relative('dist', file).split(path.sep).join('/');
  assert(!name.startsWith('../') && !path.isAbsolute(name));
  const filename = Buffer.from(name, 'utf8');
  const bytes = await readFile(file), compressed = deflateRawSync(bytes, { level: 9 }), crc = crc32(bytes);
  assert.deepEqual(inflateRawSync(compressed), bytes);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
  header.writeUInt16LE(8, 8); header.writeUInt16LE(33, 12); // Stable DOS date: 1980-01-01.
  header.writeUInt32LE(crc, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(filename.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); header.copy(central, 6, 4, 30);
  central.writeUInt32LE(offset, 42);
  localRecords.push(header, filename, compressed); centralRecords.push(central, filename);
  offset += header.length + filename.length + compressed.length;
  files.push({ path: name, bytes: bytes.length, sha256: hash(bytes), crc32: crc.toString(16).padStart(8, '0') });
}
assert(files.length < 65535 && offset < 0xffffffff, 'El paquete excede ZIP clásico.');
const central = Buffer.concat(centralRecords), end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
const zip = Buffer.concat([...localRecords, central, end]);
await mkdir('artifacts', { recursive: true });
const archive = 'artifacts/acacias-apart-static.zip';
await writeFile(archive, zip);
const manifest = { date: new Date().toISOString(), archive, sha256: hash(zip), compressedBytes: zip.length,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0), fileCount: files.length,
  source: 'Solo dist/, sin carpeta contenedora. Sin despliegue.', files };
await writeFile('artifacts/release-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
await writeFile('docs/qa/release-summary.json', JSON.stringify({ ...manifest, files: undefined }, null, 2) + '\n');
console.log(JSON.stringify({ archive, sha256: manifest.sha256, files: files.length, bytes: zip.length }));
