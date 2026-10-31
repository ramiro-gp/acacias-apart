import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Default previews are non-indexable. Release is a separate, verified local build.
export default defineConfig({
  site: 'https://www.acaciasapart.com.ar',
  output: 'static',
  integrations: process.env.SITE_RELEASE === 'true' ? [sitemap({ filter: page => !page.endsWith('/404/') })] : [],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
