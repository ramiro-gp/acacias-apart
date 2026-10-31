# Auditoría del sitio original — 31/10/2026

Fuente: https://www.acaciasapart.com.ar/. Inspección de HTML, estilos, recursos, consola, contenido y navegación en escritorio y móvil. La recuperación pública no es una copia completa del hosting.

## Evidencia preservada

- docs/source/original.html: respuesta HTML original capturada por Playwright.
- resources.json: 57 recursos con URL, archivo y SHA-256; 36 fotografías tienen copia de trabajo.
- urls.json: resultados HTTP, variantes y destinos de fragmentos.
- ../portfolio/screenshots/before-*.png: cuatro capturas ANTES sin alteraciones visuales.
- ../portfolio/screenshots/before-manifest.json: fecha, viewport, condiciones, errores, dimensiones y hashes.

Los tres PDF se recuperaron y renderizaron durante el relevamiento. Son dibujos de una página sin texto extraíble. El favicon devolvió 404. La fuente, los gráficos, los fondos y los sellos históricos se conservan aunque no se reutilice su diseño.

## Hallazgos comprobados

- Desborde horizontal en móvil; las mediciones varían con el navegador: el relevamiento IAB observó 772 px para viewport 390; la captura fullpage de Edge registró 803 px. Se conserva cada resultado con su contexto, sin igualarlos ni retocar capturas.
- Servicios generales ocultos en móvil; encabezado fijo de varias líneas y anchos de secciones de 160–200%.
- Contacto telefónico sin enlace directo a WhatsApp; correo y redes presentes.
- 83 de 85 elementos img sin atributo alt, miniaturas accionadas por onclick y cierres en spans.
- Idioma en, título vacío, diez H1 en el DOM y galerías duplicadas para desktop/mobile. Sin description, canonical, Open Graph ni JSON-LD encontrados en el documento.
- 49 imágenes de página/fondos recuperadas suman 89.223.193 bytes. Es peso de archivos, no transferencia medida, LCP ni puntuación Lighthouse. Además se preservó el sello ampliado enlazado.
- jQuery y Bootstrap repetidos, referencia HTTP a jQuery bloqueada por contenido mixto y error «$ is not defined».
- Error al cambiar miniatura por intento de escribir innerHTML sobre un elemento ausente.
- Tres solicitudes PHP observadas en las capturas devuelven 404: buscar_enrolados.php, buscar_enrolados2.php y buscar_enrolados3.php.
- Bloque de mapa con enlaces ajenos al negocio; no trasladar ese widget al rediseño.

## URLs HTTP comprobadas

La raíz HTTPS con www devuelve 200. HTTP con www y HTTPS sin www devuelven 200 sin redirigir a una variante canónica. index.html, robots.txt y sitemap.xml devuelven 404. Los tres PDF devuelven 200. Resultados y fecha exacta en urls.json. No se cambió ninguna configuración.

## Contenido y decisiones pendientes

Conservar las tres tipologías, superficies/capacidades publicadas, nueve servicios generales, equipamiento, siete condiciones comerciales, siete reglas de mascotas, planos, contacto y fotografías. Solo WhatsApp internacional fue confirmado por el usuario. El monoambiente no publica capacidad. La Paz contiene nueve fotos sin descripción turística escrita.

CONTENT.md registra las dudas y la adaptación editorial. No retirar aviso COVID, sello Safe Travels ni copyright 2021 por iniciativa técnica. No se revisó Search Console, el panel del proveedor ni la indexación efectiva; una búsqueda sin resultados no constituye prueba de desindexación.

No se ejecutó Lighthouse contra el original ni se atribuyen puntajes. No hubo modificaciones, envíos de consultas ni accesos autenticados al sitio.
