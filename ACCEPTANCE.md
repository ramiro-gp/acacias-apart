# Criterios de aceptación y evidencia

Entrega local del 31/10/2026. Diseño y contenido confirmado en docs/approvals.json. No se desplegó ni se modificó el sitio publicado.

## Preservación H0

- 57 recursos y HTML originales con SHA-256: docs/audit/resources.json y docs/source/.
- Tres PDF originales íntegros y accesibles con las mismas URLs bajo img/.
- Cuatro capturas ANTES: 1440×900, 390×844 y fullpage con desbordes originales 1455×5462 y 803×7955. Playwright 1.62.1, Edge 156.0.4314.50, DPR 1; sin alterar el sitio original.
- Respaldo independiente verificado bajo la carpeta de auditoría de esta conversación: before-backup y source-backup.
- pnpm verify:preservation comprueba hashes, parámetros equivalentes de DESPUÉS y ausencia de evidencia privada en dist/.

## Implementación y contenido H1–H4

- Astro estático, TypeScript estricto, Tailwind 4, versiones y lockfile fijados. pnpm check: 0 errores, 0 advertencias, 0 sugerencias en 37 archivos; build de release satisfactorio.
- Dirección H2 explícitamente aprobada antes de extenderla. proposal-* preserva su muestra intermedia.
- Tres tipologías, nueve servicios generales, equipamiento completo, siete condiciones y siete reglas de mascotas. 36 fotografías distintas con variantes y alt revisados, cinco álbumes; tres PDF. Ninguna foto distinta descartada.
- WhatsApp confirmado con icono en todos sus enlaces y mensajes por tipología; correo/teléfono nativos; externos con protección y aviso de pestaña nueva. No se enviaron mensajes durante QA.
- COVID y Safe Travels retirados por indicación del usuario; originales conservados. Copyright calculado con año actual; capacidad del monoambiente y domicilio de calle omitidos por falta de confirmación.
- Todos los fragmentos originales conservados; enlaces directos a normas/mascotas abren su desplegable. Navegación y detalles funcionan sin JavaScript.

## Corrección de fotografías y lightbox (iteración correctiva)

El fallo reportado era coherente con PhotoSwipe sin su hoja base: `.pswp` quedaba en el flujo normal al final de `body`, mientras sus flechas, iconos y controles perdían las reglas de posicionamiento. La corrección asegura `photoswipe/style.css` desde `SiteLayout.astro`, no desde la inicialización diferida de la galería. Las reglas aplicadas se verifican en el CSSOM en desarrollo y en el bundle estático. Además, se fija el scroll en `html` y `body` durante el modal, se cierra al pulsar el fondo, se retiene/restaura el foco y se conservan controles de PhotoSwipe.

Playwright visual real: `docs/qa/lightbox-development.json` (Astro dev) y `docs/qa/lightbox-production.json` (build de release servido localmente), 1440×900 y 390×844. En ambos entornos probó la foto principal y todas las miniaturas de las tres unidades, todas las galerías, una galería individual, navegación por controles/teclado, gestos, Escape, botón y fondo, límites del viewport, footer cubierto, iconos SVG, bloqueo de scroll, proporciones de distintas fotos, errores de consola y peticiones fallidas. Resultado: **todo pasó**, cero errores de consola y cero recursos fallidos. El ancho 320 detectado por la matriz general se corrigió reduciendo solo el H1 del hero bajo 360 px.

Capturas con el visor abierto: [escritorio desarrollo](docs/qa/lightbox/development-desktop-lightbox.png), [móvil desarrollo](docs/qa/lightbox/development-mobile-lightbox.png), [escritorio release](docs/qa/lightbox/production-desktop-lightbox.png) y [móvil release](docs/qa/lightbox/production-mobile-lightbox.png). El build usa 36 fotos identificadas; ninguna quedó bajo un botón de revelado. Las fotos de departamento van en tira horizontal y permiten abrir cualquier índice; la galería general y La Paz conservan todas sus fotos en las composiciones editoriales.

La prueba complementaria (`docs/qa/edge-cases.json`) pasó swipe táctil de Chromium, zoom, imagen fallida con restauración del foco, 404 noindex y actualización anual del copyright. El test espera que se cargue la imagen activa después del swipe antes de pulsar zoom, para no competir con la carga progresiva.

## QA final H5

Informes reproducibles: docs/qa/site-chromium.json, site-firefox.json y site-webkit.json. Tres resultados satisfactorios con Playwright 1.62.1: Chromium 151.0.7922.34, Firefox 153.0 y WebKit 26.5.

Cada motor verificó 320, 390, 768, 1024, 1440 y 1920 px sin desborde horizontal; menú por teclado/Escape y retorno del foco; enlaces; fragmentos; PDF HTTP 200; inventario de 36 fotos; carga y proporciones naturales; lightbox con flechas, ciclo de Tab, Escape y restauración; controles táctiles emulados; movimiento reducido; navegación y detalles sin JavaScript a 320 px; canonical, robots, sitemap y JSON-LD sin datos inventados. Cero errores de página, recursos fallidos o solicitudes iniciales a terceros en los recorridos automatizados.

axe WCAG 2 A/AA, 2.1 A/AA y 2.2 AA: cero infracciones automáticas con todo el contenido desplegado y dentro del lightbox, en los tres motores. La comprobación de contraste sobre imágenes en el lightbox queda marcada por axe como incompleta; se revisaron visualmente los controles claros sobre el fondo oscuro. Una auditoría automática no acredita cumplimiento WCAG completo.

Revisión visual manual del hero, alojamientos, galería, servicios, normas y pie en las capturas completas de escritorio/móvil. Google Maps se abrió mediante el botón y mostró el pin «Acacias Apart», con enlace CID 5122776448601849891. Antes de esa acción no hay iframe ni solicitudes a Google. El flotante se oculta en el lightbox y mientras el mapa cargado ocupa la vista.

Pruebas complementarias de gesto táctil, zoom, imagen fallida, 404 y cambio de año: docs/qa/edge-cases.json; su campo passed registra el resultado de la ejecución final.

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

## Cobertura pendiente y límites

No se ejecutaron lector de pantalla, dispositivos Android/iOS físicos ni zoom real de navegador al 200 %. El reflujo se comprobó a 320 px y las interacciones por teclado/táctil se automatizaron; no sustituyen esa cobertura manual. No se ejecutó validador remoto de Google/Schema.org.

Pendiente de la propietaria: capacidad del monoambiente y domicilio postal, que no se publican. Pendiente de la cuenta Wiroos: panel real, raíz, HTTPS/redirecciones, MIME, compresión, caché, 404, respaldo completo y método de subida. El usuario confirmó que no existe Search Console; su creación, verificación e indexación se realizarán en una etapa de publicación. No se usaron credenciales ni se hicieron cambios externos.
