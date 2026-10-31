# SEO técnico

## Implementado y confirmado

El build de entrega usa lang es-AR, un H1 «Departamentos turísticos en La Paz, Entre Ríos», title «Departamentos turísticos en La Paz, Entre Ríos | Acacias Apart» y description factual: «Disfrutá de tu estadía en nuestros departamentos equipados, con piscina, parque y espacios para descansar. Conocé los alojamientos y consultanos por WhatsApp.» Canonical: https://www.acaciasapart.com.ar/. Open Graph comparte el título, la descripción y una fotografía real de 1200×630; hay tarjeta social, favicon SVG y recursos locales. Las fotos tienen alt, dimensiones y variantes responsive. La 404 conserva noindex y queda fuera del sitemap.

El HTML publicado capturado en H0 tenía título vacío, `lang="en"`, diez H1 debido a bloques duplicados y no incluía description, canonical, Open Graph ni JSON-LD. La nueva landing usa un solo H1 local, título descriptivo, idioma `es-AR` y metadatos coherentes en HTML, Open Graph y LodgingBusiness. El hero y la introducción están transcritos en CONTENT.md.

JSON-LD LodgingBusiness: nombre, contacto, localidad/región/país, mapa, redes, horarios y servicios verificados. Sin calle, capacidad del monoambiente, cantidad de unidades, precios, estrellas, ofertas ni reseñas inferidas. No se promete elegibilidad para resultados enriquecidos de alquileres turísticos.

`pnpm build:release` genera HTML indexable, `robots.txt` con Allow y `sitemap-index.xml`/`sitemap-0.xml` con la única página canónica. `pnpm build` y `pnpm build:preview` conservan `noindex,nofollow` y generan robots Disallow; Vercel usa el comando de preview para evitar indexar la URL temporal. Los tests validan canonical, robots, sitemap, JSON-LD, PDF, galerías visibles y el lightbox; Lighthouse se ejecuta sobre release. Resultados en `docs/qa/lighthouse-summary.json` y `ACCEPTANCE.md`.

## Problemas detectados en el hosting actual

La comprobación HTTP de H0 registró HTTP con www y HTTPS sin www respondiendo 200 sin redirección; robots.txt y sitemap.xml respondieron 404. Evidencia fechada en docs/audit/urls.json. Normalizar variantes hacia HTTPS con www mediante el proveedor, preservando rutas y sin modificar DNS. Esta configuración no se ejecutó.

## Pendiente de producción

Verificar MIME, HTTPS, redirecciones, canonical servido, códigos 404, robots y sitemap tras la subida en Wiroos. El usuario confirmó que no existe una propiedad de Search Console; preparar su alta como prefijo de URL y verificación por archivo HTML en la cuenta de la propietaria. Enviar sitemap e inspeccionar/solicitar indexación después de publicar. Sin cambios de DNS, tracking ni monitoreo periódico. No se creó una propiedad ni se comprobó indexación real. DEPLOYMENT.md incluye el procedimiento y la fuente oficial.

No se ejecutó un validador remoto de Google/Schema.org. El JSON-LD se verificó sintácticamente y por contenido en los tres motores; Lighthouse y esa comprobación no sustituyen la validación remota ni garantizan indexación o posiciones.

## Referencias

- https://docs.astro.build/en/guides/images/
- https://schema.org/LodgingBusiness
- https://developer.chrome.com/docs/lighthouse/seo/
- https://developers.google.com/search/docs/appearance/structured-data/vacation-rental
