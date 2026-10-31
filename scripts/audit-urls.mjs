import { mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'https://www.acaciasapart.com.ar';
const original = await readFile('docs/source/original.html', 'utf8');
const urls = [
  `${origin}/`, `${origin}/index.html`, 'http://www.acaciasapart.com.ar/',
  'https://acaciasapart.com.ar/', `${origin}/robots.txt`, `${origin}/sitemap.xml`,
  ...[...original.matchAll(/\bhref=["']([^"']+\.pdf\s*)["']/gi)].map(match => new URL(match[1].trim(), origin).href),
];
const records = await Promise.all([...new Set(urls)].map(async url => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const isControl = /robots\.txt|sitemap\.xml/.test(url);
    const text = isControl ? (await response.text()).slice(0, 4000) : null;
    return { url, status: response.status, finalUrl: response.url, redirected: response.redirected, contentType: response.headers.get('content-type'), ...(isControl ? { body: text } : {}), migration: /\.pdf/.test(url) ? 'Preservada con archivo estático en public/img/.' : /index\.html/.test(url) ? 'El build genera index.html; conservar acceso sin depender de reescrituras SPA.' : /robots\.txt|sitemap\.xml/.test(url) ? 'Configurar en H5 según aprobación de indexabilidad.' : 'Conservar dominio; revisar canonical y redirecciones con el proveedor, sin modificar DNS.' };
  } catch (error) {
    return { url, error: error.message, verified: false, migration: 'Verificar con el proveedor antes de publicación.' };
  }
}));
const hashTargets = ['deptos', 'fotitos', 'normaslink', 'linkmascotas', 'linkpaz', 'lapazcontenidos2'].map(id => ({ id, existedInOriginal: new RegExp(`id=["']${id}["']`).test(original), migration: 'Conservar en H3; el fragmento no se envía al servidor.' }));
await mkdir('docs/audit', { recursive: true });
await writeFile('docs/audit/urls.json', JSON.stringify({ date: new Date().toISOString(), records, hashTargets }, null, 2) + '\n');
console.log(JSON.stringify(records.map(({ url, status, error, finalUrl }) => ({ url, status, error, finalUrl })), null, 2));
