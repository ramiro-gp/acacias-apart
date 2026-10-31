# Acacias Apart

Landing estática implementada en Astro, con diseño aprobado, tres tipologías, 36 fotografías y contacto por WhatsApp/correo. Sin publicación automática ni backend.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Para comprobar y servir el paquete indexable:

```sh
pnpm check
pnpm build:release
pnpm preview --port 4321
pnpm verify:preservation
pnpm test:e2e
pnpm test:lightbox:dev
node scripts/with-local-site.mjs preview tests/e2e/lightbox-visual.mjs
node scripts/with-local-site.mjs preview scripts/lighthouse.mjs
pnpm package:release
```

Vista local: http://127.0.0.1:4321/. `pnpm build` y `pnpm build:preview` generan una revisión noindex con `robots.txt` bloqueado; `pnpm build:release` produce el sitio indexable. `pnpm test:lightbox:dev` sirve Astro y ejecuta la prueba visual en desarrollo; el runner `scripts/with-local-site.mjs` también sirve el build local para las verificaciones de release. Publicar solo el contenido de `dist/` en Wiroos, según DEPLOYMENT.md. Los previews de Vercel están preparados pero no publicados.

Contenido y aprobaciones: CONTENT.md y docs/approvals.json. Arquitectura/comandos: TECHNICAL.md. Pruebas y límites: ACCEPTANCE.md. La capacidad del monoambiente y el domicilio postal no se inventan: están omitidos. El proveedor final es Wiroos; falta verificar la configuración de la cuenta y crear Search Console en la futura publicación. GitHub es la fuente del código. No se modifica Wiroos ni DNS en esta iteración.
