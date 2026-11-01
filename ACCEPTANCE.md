# Criterios de aceptación y evidencia

Entrega local actualizada el 01/11/2026 sobre la base del 31/10/2026. Diseño y contenido confirmado en docs/approvals.json. No se desplegó ni se modificó el sitio publicado.

## Preservación H0

- 57 recursos y HTML originales con SHA-256: docs/audit/resources.json y docs/source/.
- Tres PDF originales íntegros y accesibles con las mismas URLs bajo img/.
- Cuatro capturas ANTES: 1440×900, 390×844 y fullpage con desbordes originales 1455×5462 y 803×7955. Playwright 1.62.1, Edge 156.0.4314.50, DPR 1; sin alterar el sitio original.
- Respaldo independiente verificado bajo la carpeta de auditoría de esta conversación: before-backup y source-backup.
- pnpm verify:preservation comprueba hashes, parámetros equivalentes de DESPUÉS y ausencia de evidencia privada en dist/.

## Implementación y contenido H1–H4

- Astro estático, TypeScript estricto, Tailwind 4, versiones y lockfile fijados. pnpm check: 0 errores, 0 advertencias, 0 sugerencias en 37 archivos; build de release satisfactorio.
- Dirección H2 explícitamente aprobada antes de extenderla. proposal-* preserva su muestra intermedia.
- Tres tipologías, nueve servicios generales, equipamiento completo, siete condiciones y siete reglas de mascotas. 41 fotografías distintas con variantes y alt revisados, cinco álbumes; tres PDF. Tres imágenes del estar se actualizaron y se añadieron cinco fotos al complejo y a La Paz.
- WhatsApp confirmado con icono en todos sus enlaces y mensajes por tipología; correo/teléfono nativos; externos con protección y aviso de pestaña nueva. No se enviaron mensajes durante QA.
- COVID y Safe Travels retirados por indicación del usuario; originales conservados. Copyright calculado con año actual; capacidad del monoambiente y domicilio de calle omitidos por falta de confirmación.
- Todos los fragmentos originales conservados; enlaces directos a normas/mascotas abren su desplegable. Navegación y detalles funcionan sin JavaScript.

## Corrección de fotografías y lightbox (iteración correctiva)

El fallo reportado era coherente con PhotoSwipe sin su hoja base: `.pswp` quedaba en el flujo normal al final de `body`, mientras sus flechas, iconos y controles perdían las reglas de posicionamiento. La corrección asegura `photoswipe/style.css` desde `SiteLayout.astro`, no desde la inicialización diferida de la galería. Las reglas aplicadas se verifican en el CSSOM en desarrollo y en el bundle estático. Además, se fija el scroll en `html` y `body` durante el modal, se cierra al pulsar el fondo, se retiene/restaura el foco y se conservan controles de PhotoSwipe.

Playwright visual real: `docs/qa/lightbox-development.json` (Astro dev) y `docs/qa/lightbox-production.json` (build de release servido localmente), 1440×900 y 390×844. En ambos entornos probó la foto principal y todas las miniaturas de las tres unidades, todas las galerías, una galería individual, navegación por controles/teclado, gestos, Escape, botón y fondo, límites del viewport, footer cubierto, iconos SVG, bloqueo de scroll, proporciones de distintas fotos, errores de consola y peticiones fallidas. Resultado: **todo pasó**, cero errores de consola y cero recursos fallidos. El ancho 320 detectado por la matriz general se corrigió reduciendo solo el H1 del hero bajo 360 px.

Capturas con el visor abierto: [escritorio desarrollo](docs/qa/lightbox/development-desktop-lightbox.png), [móvil desarrollo](docs/qa/lightbox/development-mobile-lightbox.png), [escritorio release](docs/qa/lightbox/production-desktop-lightbox.png) y [móvil release](docs/qa/lightbox/production-mobile-lightbox.png). El build registrado el 31/10 usa 36 fotos identificadas; ninguna quedó bajo un botón de revelado. Las fotos de departamento van en tira horizontal y permiten abrir cualquier índice; la galería general y La Paz conservan todas sus fotos en las composiciones editoriales. El inventario actual de 41 fotos se registra en la actualización del 01/11.

La prueba complementaria (`docs/qa/edge-cases.json`) pasó swipe táctil de Chromium, zoom, imagen fallida con restauración del foco, 404 noindex y actualización anual del copyright. El test espera que se cargue la imagen activa después del swipe antes de pulsar zoom, para no competir con la carga progresiva.

## QA final H5 (evidencia de 31/10/2026)

Los resultados de esta sección corresponden a la versión anterior, de 36 fotos. La actualización del 01/11 no repitió la matriz de Playwright ni axe; los informes y capturas se conservan como evidencia histórica, no como validación del estado actual.

Informes reproducibles: docs/qa/site-chromium.json, site-firefox.json y site-webkit.json. Tres resultados satisfactorios con Playwright 1.62.1: Chromium 151.0.7922.34, Firefox 153.0 y WebKit 26.5.

Cada motor verificó 320, 390, 768, 1024, 1440 y 1920 px sin desborde horizontal; menú por teclado/Escape y retorno del foco; enlaces; fragmentos; PDF HTTP 200; inventario de 36 fotos; carga y proporciones naturales; lightbox con flechas, ciclo de Tab, Escape y restauración; controles táctiles emulados; movimiento reducido; navegación y detalles sin JavaScript a 320 px; canonical, robots, sitemap y JSON-LD sin datos inventados. Cero errores de página, recursos fallidos o solicitudes iniciales a terceros en los recorridos automatizados.

axe WCAG 2 A/AA, 2.1 A/AA y 2.2 AA: cero infracciones automáticas con todo el contenido desplegado y dentro del lightbox, en los tres motores. La comprobación de contraste sobre imágenes en el lightbox queda marcada por axe como incompleta; se revisaron visualmente los controles claros sobre el fondo oscuro. Una auditoría automática no acredita cumplimiento WCAG completo.

Revisión visual manual del hero, alojamientos, galería, servicios, normas y pie en las capturas completas de escritorio/móvil. Google Maps mostró el pin «Acacias Apart», con enlace CID 5122776448601849891. La petición actual de la propietaria cambió el mapa de carga por acción a iframe activo desde la página; el botón intermedio se eliminó. La implementación inicial ocultaba WhatsApp sobre el mapa y dentro de PhotoSwipe; los ajustes posteriores lo mantienen visible y utilizable en ambos casos.

Pruebas complementarias de gesto táctil, zoom, imagen fallida, 404 y cambio de año: docs/qa/edge-cases.json; su campo passed registra el resultado de la ejecución final.

## Ajustes visuales recientes

En la vista local de Codex se aplicó una cuadrícula editorial en columnas CSS balanceadas para «Los detalles de una buena pausa» y «Hay lugares que invitan a quedarse»: tres columnas en escritorio, dos en tablet y una en móvil, con proporciones originales, bordes cuadrados y separación uniforme. También se adaptaron los scrollbars a verde/salvia, se abrió por defecto «Condiciones y normas de convivencia», se activó el mapa en el iframe inicial, se añadió el subrayado hover/focus a los enlaces de tipologías y se redujo la altura del header. En la siguiente iteración se quitaron los cuatro rótulos y el pie de galería, se actualizó el H1, los enlaces del header pasaron a `#la-paz` y `#contacto` conservando alias anteriores, y se añadió el crédito enlazado del footer. El navegador integrado confirmó el H1 actualizado, fotos sin leyendas, acordeón abierto, iframe de Maps activo y enlace de Ramiro García; todavía no se repitieron las capturas ni la matriz formal de QA después de estos ajustes.

En la iteración del 31/10/2026, el menú móvil pasó a ser una capa de pantalla completa con navegación de gran tamaño, bloqueo de scroll, Escape, foco restaurado, ciclo de teclado y animación de cierre inversa; se añadió el rótulo de marca social con iconos de Instagram/Facebook, se igualó el color del corazón y el crédito, y se simplificó el rótulo del hero a «NUESTRO LUGAR». `pnpm check`: 0 errores, 0 advertencias y 0 sugerencias en 40 archivos. `pnpm build:preview`: satisfactorio, estático y con noindex/robots Disallow. El preview actualizado cargó desde el túnel de Cloudflare. `git diff --check` no informó errores de whitespace; Git mostró avisos de conversión LF/CRLF. No se repitió la matriz de navegadores ni se agregó o ejecutó una prueba automatizada para este ajuste; las capturas formales existentes corresponden al estado anterior.

En el ajuste siguiente del 31/10/2026, WhatsApp permanece visible sobre el mapa y dentro de PhotoSwipe; en la galería se monta como parte del diálogo modal y se incluye en su ciclo de foco. El menú móvil baja desde el borde inferior del header, dejando siempre a la vista el logo y el botón que alterna a una X; la hoja cubre el espacio restante de la pantalla. `pnpm check`: 0 errores, 0 advertencias y 0 sugerencias en 40 archivos. `pnpm build:preview`: satisfactorio, estático y con noindex/robots Disallow. No se ejecutó la matriz de navegadores para esta iteración.

## Lighthouse de laboratorio

Lighthouse 13.6.0, Chromium 151.0.7922.34, build estático indexable servido en 127.0.0.1. Tres corridas secuenciales por perfil, sin otras pruebas de navegador concurrentes. Informes crudos y condiciones: docs/qa/lighthouse/; resumen: docs/qa/lighthouse-summary.json.

| Mediana de tres corridas | Móvil | Escritorio |
|---|---:|---:|
| Rendimiento | 100 | 100 |
| Accesibilidad | 100 | 100 |
| Buenas prácticas | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 0,909 s | 0,587 s |
| CLS | 0 | 0 |

Las seis corridas finales alcanzaron SEO 100 y rendimiento mediano 100 en móvil y escritorio. LCP de laboratorio: 0,909 s móvil y 0,587 s escritorio; CLS 0. Esto no demuestra resultados de campo ni cumplimiento de Core Web Vitals en usuarios. Las corridas iniciales del rediseño anteriores a corregir el salto del menú se conservan aparte en lighthouse-initial/; no son mediciones del sitio antiguo.

## Evidencia y entrega H6

- Cuatro PNG DESPUÉS en docs/portfolio/screenshots/: primera pantalla 1440×900 y 390×844; fullpage 1440×15276 y 390×15541. Mismo Edge, Playwright, DPR, idioma, zona horaria y condiciones que ANTES. Sin errores ni recursos fallidos. Desplegables cerrados, menú cerrado y mapa sin cargar. Las fullpage son complementarias; no se deforman para comparar longitudes distintas. Los hashes ANTES siguen iguales.
- before-manifest.json y after-manifest.json conservan hashes y condiciones. manifest.json agrupa ambos. Respaldo independiente DESPUÉS comprobado en audit/after-backup, fuera del proyecto.
- artifacts/acacias-apart-static.zip contiene solo dist/. Manifiesto de rutas/hashes en artifacts/release-manifest.json y resumen en docs/qa/release-summary.json. Integridad de CRC y SHA-256 de cada archivo comprobada también con Python zipfile; tres PDF exactos y ausencia de docs/, capturas, fuentes de desarrollo y herramientas.
- DEPLOYMENT.md adapta las instrucciones generales oficiales a Wiroos e incluye publicación/reversión, configuración que debe confirmar el proveedor y alta futura de Search Console sin DNS.

## Checkout limpio y GitHub

El commit inicial `5c5b8e3` se instaló desde un checkout limpio del repositorio con `pnpm install --frozen-lockfile --offline`: 377 paquetes del lockfile, cero descargas. `pnpm check`, `pnpm build:preview` y `pnpm verify:preservation` pasaron en ese checkout; el build volvió a generar 338 variantes de imagen, mantuvo el preview noindex y confirmó la preservación de los recursos disponibles. El archivo local de auditoría original valida 57 archivos y cuatro capturas ANTES, y permanece fuera del repositorio; por eso la comprobación de preservación del checkout limpio verifica las 36 fotos integradas y las cuatro capturas conservadas en el proyecto.

El código y la documentación están publicados en [GitHub, rama main](https://github.com/ramiro-gp/acacias-apart), commit `5c5b8e3` («Complete Acacias Apart corrective release»). `dist/`, `node_modules/`, el paquete generado y archivos de entorno quedan excluidos del repositorio. El ZIP estático es un artefacto local de entrega y no se subió al sitio.

## Cobertura pendiente y límites

No se ejecutaron lector de pantalla, dispositivos Android/iOS físicos ni zoom real de navegador al 200 %. El reflujo se comprobó a 320 px y las interacciones por teclado/táctil se automatizaron; no sustituyen esa cobertura manual. No se ejecutó validador remoto de Google/Schema.org.

Pendiente de la propietaria: capacidad del monoambiente y domicilio postal, que no se publican. Pendiente de la cuenta Wiroos: panel real, raíz, HTTPS/redirecciones, MIME, compresión, caché, 404, respaldo completo y método de subida. El usuario confirmó que no existe Search Console; su creación, verificación e indexación se realizarán en una etapa de publicación. No se usaron credenciales ni se hicieron cambios externos.

## Actualización fotográfica y microtexto del hero — 01/11/2026

- El rótulo junto a la fotografía del hero ahora dice «NUESTRO LUGAR. TU LUGAR.».
- Se reemplazaron las tres fotos retiradas del estar de dos ambientes con las tomas nuevas del sofá actualizado. Se añadieron tres fotos a la galería del complejo y dos a la galería de La Paz. El inventario actual es 5 fotos de tres ambientes, 6 de dos ambientes, 5 del monoambiente, 14 del complejo y 11 de La Paz: 41 en total.
- Los originales aportados se preservaron byte por byte bajo `docs/source/updates-2026-11-01/`; sus nombres, dimensiones y hashes SHA-256 están en `docs/audit/resources.json`. Las tres imágenes antiguas continúan en el archivo histórico original y no se incluyen en el build. La carpeta temporal `img/` se eliminó después de verificar las ocho copias.
- `pnpm check`: pasó, 0 errores, 0 advertencias y 0 sugerencias en 40 archivos. `pnpm build`: pasó en modo estático; generó 2 páginas y 383 variantes optimizadas de imagen. `pnpm verify:preservation`: pasó, verificó 57 recursos originales, las 8 fotos nuevas archivadas y de trabajo, las 4 capturas ANTES y la exclusión de evidencia del bundle.
- No se ejecutaron Playwright ni axe para esta entrega y no se tomaron nuevas capturas; la prueba de inventario `tests/e2e/site.mjs` sí quedó actualizada para esperar 41 fotos. Por eso la cobertura de interacción y accesibilidad automatizada sigue siendo la de la versión anterior.

## Corrección de galerías y menú tras scroll — 01/11/2026

Se corrigió la clasificación de `complex-15`: es la palmera junto al agua al atardecer y pertenece a La Paz. `la-paz-11` es el perro y se ubica en la tercera columna de escritorio; la palmera ocupa su posición anterior. El inventario permanece en 41 fotos, con 13 en el álbum del complejo y 12 en La Paz. Se conservaron los nombres de archivo y todos los originales/hashes.

Las columnas de escritorio tienen anchos calculados según las proporciones originales y un borde inferior común. No se recortan ni deforman fotos; la proporción también se reserva antes de cargar. Tablet y móvil mantienen dos y una columna respectivamente, con orden de lectura por columnas en el DOM.

Reproducción del bug en Chromium móvil 390×844: al abrir el menú desde scrollY=650, el header sticky pasaba de y=0 a y=-650. La navegación móvil mejorada ahora fija el header al borde superior y reserva su altura en el cuerpo; el menú continúa abriéndose debajo del header.

`pnpm check`: 42 archivos, 0 errores/advertencias/sugerencias. `pnpm build`: estático, 2 páginas y 383 variantes optimizadas. `pnpm verify:preservation`: pasó, 57 originales, 8 fotos aportadas archivadas/de trabajo y 4 capturas ANTES. `git diff --check`: sin errores de whitespace.

Prueba focalizada `tests/e2e/gallery-menu.mjs`: pasó en desarrollo y en el build estático con Chromium y axe. Informes: `docs/qa/gallery-menu-development-2026-11-01.json` y `docs/qa/gallery-menu-production-2026-11-01.json`, con capturas privadas del mismo prefijo. Verificó 320, 390, 768, 960, 1440 y 1920 px sin desborde; asignación de fotos; bordes inferiores con diferencia máxima de 0,079 px en escritorio; apertura de fotos movidas en PhotoSwipe, teclado/Escape y restauración del foco; menú desde scroll 0, 650 y 1600, botón de cierre accesible, retorno de scroll, navegación por enlace y movimiento normal/reducido. Axe: cero infracciones automáticas en escritorio y menú móvil, en ambos entornos. Esta prueba complementa y actualiza la falta de cobertura de la entrega fotográfica anterior; no repite la matriz histórica completa de Firefox/WebKit ni pruebas físicas.

La inspección del hero confirmó un AVIF seleccionado de 71.953 bytes en escritorio y prioridad alta existente. En una corrida local su duración fue 243 ms con `/_image` en desarrollo frente a 8 ms con `/_astro` en preview estático. No se necesita recomprimir originales con Squoosh: Astro genera tamaños y formatos al compilar. Estas mediciones no acreditan rendimiento en hosting ni identifican por sí solas la causa exacta de la recarga del usuario.

## Publicación de código y enlace compartible — 01/11/2026

El usuario autorizó commit y push al repositorio de DEPLOYMENT.md y solicitó un túnel Cloudflare. Se comprobó que `origin` apunta a `https://github.com/ramiro-gp/acacias-apart.git` y que `main` no tenía divergencia tras fetch. Se regeneró `pnpm build:preview` satisfactoriamente con noindex y robots bloqueado.

El Quick Tunnel https://agreed-neil-remarkable-pads.trycloudflare.com sirve exclusivamente el preview estático del puerto local 4322. Comprobación pública: portada HTTP 200, 41 fotos, noindex, robots Disallow y hero HTTP 200 con MIME `image/avif`. Los procesos locales deben seguir activos para conservar el enlace. No se modificaron Wiroos, DNS ni el sitio original.
