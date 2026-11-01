# Arquitectura técnica

## Versiones y build

Versiones verificadas el 31/10/2026 y fijadas en package.json/pnpm-lock.yaml: Astro 7.4.4, TypeScript 6.0.3, Tailwind 4.3.3 con @tailwindcss/vite 4.3.3, PhotoSwipe 5.4.4, pnpm 11.7.0; fuentes variables Fraunces y Manrope 5.3.0. Node >=22.23.4; entorno utilizado 24.12.0. No hay adaptador de servidor ni runtime de Node en producción.

Astro genera HTML estático; Sharp procesa imágenes durante el build. Hero AVIF/WebP/JPEG con prioridad alta; el resto WebP/JPEG responsive, dimensiones explícitas y carga diferida. Galerías con masonry CSS balanceado y proporción natural; hero con encuadre editorial. Fuentes WOFF2 y licencias locales. El iframe de Google Maps se carga automáticamente; es la integración de terceros de la página.

## Organización y datos

Las galerías editoriales usan `EditorialGallery.astro`: el orden de fotos por columna está en los datos tipados y sus anchos se calculan al compilar para compartir una altura final. Se respetan las proporciones naturales y el orden del DOM; no hace falta JavaScript para el layout. Las imágenes reservan su proporción antes de cargar. En tablet se distribuyen en dos columnas y en móvil en una. El header de la navegación móvil mejorada es fijo y el cuerpo reserva su altura, evitando que desaparezca al bloquear el scroll del menú.

No hace falta comprimir manualmente los JPG originales: `Picture` y `getImage` ya generan derivados locales. En desarrollo `/_image` transforma bajo demanda; en el build estático se sirven archivos `/_astro` precompilados. En la prueba local de escritorio del 01/11/2026 el hero eligió un AVIF de 71.953 bytes, con prioridad alta. Los tiempos de esa corrida fueron 243 ms en desarrollo y 8 ms en preview estático; no son mediciones de usuarios ni una reproducción de la recarga reportada. Referencia: https://docs.astro.build/en/reference/image-service-reference/.

- src/data/: tipos Accommodation/PhotoRecord, tres tipologías, fotos y contacto centralizado. Capacidad del monoambiente nullable y domicilio null. CONTENT.md registra confirmaciones.
- src/assets/photos/: 41 fotos de trabajo; originales inmutables en docs/source/. Astro respeta la orientación EXIF.
- src/components/: layout, secciones y UI Astro. Sin framework de interfaz.
- src/scripts/: navegación, desplegables por fragmento y PhotoSwipe. La hoja PhotoSwipe se incluye en el layout base; el núcleo del lightbox se importa dinámicamente. Overlay modal fijo, bloqueo de scroll, fondo/Escape/flechas/táctil, foco contenido/restaurado y movimiento reducido.
- public/img/: tres PDF con nombres y URLs originales. public/brand/: SVG editables. public/fonts/: WOFF2 y licencias.
- docs/: fuente, auditoría, aprobaciones, capturas y QA privados. artifacts/: herramientas de navegador y paquetes, excluidos de TypeScript y publicación.

El menú se mejora desde el primer paint para evitar saltos de diseño. En móvil ocupa todo el espacio bajo el header, que permanece visible con el logo y control de cierre; se abre desde el borde inferior del header y se cierra en sentido inverso. Al abrirlo bloquea el scroll e inhabilita sus enlaces al cerrarse, con Escape, foco restaurado y recorrido cíclico de teclado. Se respeta movimiento reducido. El enlace flotante de WhatsApp permanece visible sobre el mapa y dentro del diálogo de PhotoSwipe: durante la galería se mueve temporalmente dentro del modal para conservar la visibilidad, interacción y ciclo de foco. Sin JavaScript, enlaces, desplegables e imágenes siguen disponibles. El copyright se calcula al compilar y se actualiza en el cliente al cambiar el año; sin JavaScript requiere reconstrucción anual.

## Comandos

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build                  # revisión local noindex, robots bloqueado
pnpm build:preview          # fuerza el mismo modo noindex para Vercel
pnpm build:release          # indexable, sitemap, exige aprobaciones registradas
pnpm preview --port 4321
pnpm verify:preservation
pnpm test:e2e
pnpm test:lightbox           # QA visual de ambos tamaños en dev o QA_URL
pnpm test:lightbox:dev       # inicia y detiene Astro dev para la prueba
node scripts/with-local-site.mjs preview tests/e2e/lightbox-visual.mjs
node tests/e2e/edge-cases.mjs
node scripts/with-local-site.mjs preview scripts/lighthouse.mjs
pnpm package:release
```

El preview sirve dist/. `build:preview` valida el noindex y robots Disallow. Después de un build de revisión, ejecutar build:release antes de probar SEO o preparar el paquete. SITE_RELEASE=true se establece dentro del script de release. `with-local-site.mjs` inicia Astro en localhost y corre la comprobación indicada antes de apagar el servidor. Vercel usa siempre el comando de preview; la publicación temporal queda pendiente de acceso Pro/Enterprise y de conectar el repositorio.

## Navegadores y capturas

Playwright 1.62.1, axe 4.14.0 y Lighthouse 13.6.0 fijados. QA_BROWSER selecciona chromium, firefox o webkit; instalar navegadores con `pnpm exec playwright install chromium firefox webkit`. En este entorno están bajo artifacts/browsers (browser-runtime.mjs los detecta). No se usa el perfil personal del usuario. edge-cases.mjs añade gesto de entrada CDP, zoom, error de imagen, 404 y copyright con fecha futura.

`pnpm capture before|proposal|after URL` conserva manifiesto, fecha, URL, dimensiones y SHA-256; se niega a sobrescribir evidencia. ANTES y DESPUÉS usan Edge 156.0.4314.50, Playwright 1.62.1, DPR 1, locale es-AR, zona America/Argentina/Buenos_Aires, esquema claro y red sin throttling. PLAYWRIGHT_CHANNEL=msedge selecciona el canal. Mobile identifica únicamente viewport 390×844; no un teléfono físico. Desktop: 1440×900. No se inyectan estilos ni máscaras. Fullpage de la nueva web desplaza normalmente las imágenes visibles y vuelve al inicio, conservando desplegables cerrados.

Lighthouse usa Chromium oficial y perfiles móvil/escritorio predeterminados, tres corridas secuenciales por perfil. Las condiciones simuladas están en cada JSON. No mide Core Web Vitals de campo.
