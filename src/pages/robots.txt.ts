import type { APIRoute } from 'astro';
import { releaseReady, site } from '../data/site';

const body = releaseReady
  ? `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', site.canonical).href}\n`
  : 'User-agent: *\nDisallow: /\n';

export const GET: APIRoute = () => new Response(body, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
