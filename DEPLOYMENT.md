# Publicación futura en Wiroos

## Estado confirmado y límites

El usuario identificó Wiroos como proveedor el 31/10/2026. No conoce con certeza el método de subida y confirmó que no existe una propiedad de Search Console. No se accedió a la cuenta, no se subió ningún archivo y no se modificaron DNS ni configuración del servidor.

## Repositorio de código

El código fuente y la documentación están publicados en [github.com/ramiro-gp/acacias-apart](https://github.com/ramiro-gp/acacias-apart), rama `main`, commit `5c5b8e3` («Complete Acacias Apart corrective release»). El repositorio no incluye `dist/`, `node_modules/`, `artifacts/` ni la copia de auditoría original local. El paquete estático listo para la futura subida se genera localmente con `pnpm package:release`; todavía no se cargó a Wiroos.

Wiroos documenta [Administrador de archivos de cPanel y public_html](https://clientes.wiroos.com/index.php?rp=%2Fknowledgebase%2F176%2FiComo-subir-archivos-utilizando-el-cPanel.html) y también [subida por FTP](https://clientes.wiroos.com/knowledgebase/98/Como_subo_mi_sitio_a_los_servidores_de_Wiroos.html). Consultado el 31/10/2026. Esto acredita opciones generales del proveedor, no el panel ni la raíz concreta de esta cuenta. Confirmarlos desde el panel o soporte antes de reemplazar nada.

## Vercel: preview temporal preparado, sin publicar

El usuario pidió dejar el repositorio listo para mostrar la propuesta. Se configuró `vercel.json`: framework Astro, instalación `pnpm install --frozen-lockfile`, comando `pnpm build:preview` y salida `dist/`. `package.json` requiere Node `>=22.23.4` y pnpm `11.7.0`; comprobar en el primer registro de compilación que Vercel resuelva una versión de Node que cumpla ese mínimo.

`build:preview` fuerza `SITE_RELEASE=false` aun si el entorno recibe otra variable. El HTML conserva `noindex,nofollow`, `robots.txt` prohíbe el rastreo y no se genera sitemap. El build indexable de `build:release` queda reservado a la publicación definitiva en Wiroos. No se incorporó analítica ni se cambiaron DNS, dominio o canonical del sitio definitivo.

**Límite comercial comprobado el 31/10/2026:** el sitio promociona un alojamiento que opera como negocio. Los términos de Vercel reservan Hobby para uso personal y exigen Pro o Enterprise para el comercial. La [definición de uso comercial](https://vercel.com/docs/limits/fair-use-guidelines) incluye despliegues orientados a la ganancia; revisar también los [términos vigentes](https://vercel.com/legal/terms) y [planes](https://vercel.com/pricing). No desplegar este proyecto comercial en Hobby. La conexión de Vercel consultada no mostró equipos ni proyectos; no se creó un proyecto ni se publicó una URL. Para habilitar el preview se requiere acceso a una cuenta con plan Pro/Enterprise.

### Pasos para habilitarlo cuando la cuenta comercial esté disponible

1. Abrir Vercel con la cuenta/equipo Pro o Enterprise de la propietaria e importar `https://github.com/ramiro-gp/acacias-apart.git` desde GitHub.
2. Conservar `main` como rama estable. En ajustes de Git, dejar como «Production Branch» una rama de publicación que no se use mientras la web definitiva siga en Wiroos; así los pushes de `main` crean previews, no una implementación marcada como producción. No agregar dominio personalizado.
3. Usar la configuración del repositorio (Astro, `pnpm install --frozen-lockfile`, `pnpm build:preview`, `dist/`). No crear variables `SITE_RELEASE=true`; revisar el log de Node y el HTML `noindex` del primer preview.
4. Vercel crea un deployment preview para cada push a una rama que no sea la rama de producción configurada. Compartir solo la URL del preview con la propietaria. No usarla como canonical ni solicitar su indexación.
5. Al aceptar y publicar la versión definitiva en Wiroos por separado, eliminar el proyecto de Vercel o desconectar su integración de GitHub y retirar los previews. Verificar que `www.acaciasapart.com.ar` siga en Wiroos y que el sitio original no haya cambiado.

Estado de acceso observado: las herramientas conectadas no devolvieron equipos ni proyectos Vercel; por eso quedan pendientes la conexión de GitHub a Vercel, confirmar plan/acceso Pro y crear el preview. No se pidió acceso a credenciales ni se intentó publicar.

## Paquete preparado

artifacts/acacias-apart-static.zip contiene únicamente los archivos de dist/, sin carpeta contenedora. artifacts/release-manifest.json registra cada ruta, tamaño, SHA-256, CRC32 y hash del ZIP. docs/qa/release-summary.json conserva el resumen. pnpm package:release comprueba release indexable, pruebas, capturas, preservación y exclusión de archivos privados antes de empaquetar.

No necesita Node en el hosting. HTML, CSS, JS, SVG, AVIF, WebP, JPEG, WOFF2 y PDF deben servirse con MIME correcto. Solo hay dos documentos HTML: index.html y 404.html; robots y sitemap son estáticos. No utilizar reescritura universal de SPA.

## Preparación con el proveedor

1. Confirmar qué carpeta corresponde a www.acaciasapart.com.ar; la guía general menciona public_html, pero puede variar para dominios adicionales.
2. Descargar un respaldo completo del sitio y la configuración vigente, incluidos archivos ocultos. El rescate público de H0 no es una copia completa del hosting. Guardarlo fuera de la raíz pública.
3. Confirmar HTTPS, compresión Brotli/gzip, MIME AVIF/WebP/WOFF2, manejo de 404, caché y método de sustitución que evite una carga parcial. Confirmar soporte de redirecciones antes de escribir reglas.
4. Revisar .htaccess y la prioridad de index.php/index.html actuales con soporte. No sustituir archivos de configuración del proveedor ni carpetas de correo, certificados o verificación.
5. Preservar los tres PDF con espacios y mayúsculas exactos; hoy responden 200. La advertencia genérica de Wiroos sobre nombres no justifica romper sus URLs existentes.

## Subida a cargo del usuario

Con respaldo verificado y aprobación final de la entrega, abrir Administrador de archivos, elegir la raíz confirmada, cargar el ZIP y extraer su contenido. index.html debe quedar directamente en esa raíz, junto a _astro/, brand/, fonts/, img/, robots.txt y sitemap*.xml. El ZIP no incluye configuraciones del servidor. Una vez comprobada la extracción, retirar el ZIP subido del directorio público. No subir código fuente, docs/, capturas, originales, herramientas, credenciales ni el manifiesto privado.

Conservar las rutas anteriores según docs/audit/urls.json y la matriz final docs/audit/url-migration.json. Esta última incluye cada recurso recuperado y el destino propuesto para las fotos antiguas. Sus 301 todavía no están aplicados; confirmarlos con soporte y regenerar la matriz al cambiar derivados. Los fragmentos no requieren reglas del servidor. Proponer redirección permanente de HTTP y HTTPS sin www hacia https://www.acaciasapart.com.ar/, conservando ruta y consulta. Configurar 404.html como documento de error manteniendo HTTP 404. No hacer cambios DNS. Para recursos con hash en _astro/, proponer caché larga immutable; HTML/robots/sitemap con revalidación. La compatibilidad real está pendiente de comprobar en la cuenta.

## Verificación y reversión

Comprobar desde una sesión limpia: dominio/HTTPS/redirecciones, portada móvil, menú, todas las secciones, las 36 fotos, ampliación, tres PDF, enlaces de contacto sin enviar mensajes, mapa voluntario, robots Allow, sitemap/canonical y una URL inexistente con HTTP 404. Revisar respuestas MIME y compresión. Repetir Lighthouse sobre la URL pública; las mediciones locales no representan al hosting.

Si faltan recursos, se pierde navegación/contacto o aparecen errores que impidan la visita, restaurar los archivos y configuración del respaldo completo con el método del proveedor. No hay base de datos ni migración de datos.

## Search Console: alta pendiente

Crear una propiedad de prefijo de URL para https://www.acaciasapart.com.ar/ en la cuenta de la propietaria. Elegir archivo HTML, descargar el archivo exacto de Google, incorporarlo a public/ sin cambiar su nombre/contenido y reconstruir el paquete (conservarlo en publicaciones futuras). Publicarlo en la raíz y verificar su URL sin autenticación. Después completar «Verificar», enviar sitemap-index.xml e inspeccionar/solicitar indexación de la portada. Este método está documentado por [Google](https://support.google.com/webmasters/answer/9008080?hl=es) y permite continuar sin DNS. No se creó una cuenta ni propiedad, no se inventó un token y no se atribuye un estado de indexación comprobado.
