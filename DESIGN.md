# Sistema visual

Estado: **confirmado**. El usuario aprobó explícitamente el logo de ramita, paleta, tipografías, hero, módulo de alojamiento y galería antes de extenderlos al resto de la landing. Registro del 31/10/2026 en docs/approvals.json.

## Concepto

Naturaleza cotidiana, descanso y espacios propios. Fotografía real protagonista; estructura editorial con márgenes amplios, reglas finas y pocos elementos decorativos. Las fotografías no se sustituyen por imágenes generadas ni se retocan para alterar instalaciones.

## Tokens

| Uso | Valor |
|---|---|
| Fondo marfil | #f6f4ed |
| Texto y superficies verdes | #263e32 |
| Texto secundario | #62695e |
| Verde salvia claro | #e9ecdf |
| Acento y foco sobre marfil | #87583e |
| Foco sobre verde oscuro | #e4c08b |
| Líneas | #d8dace |

Tipografía confirmada: Fraunces para títulos y Manrope para cuerpo. Archivos WOFF2 locales y licencias SIL OFL en public/fonts/. Texto principal de 16 px como mínimo; rótulos y pies complementarios menores, revisados en QA. Controles principales de 44 px o más. Respetar prefers-reduced-motion.

## Marca

Ramita vectorial con hojas y palabra «acacias» con «APART» secundario. Archivos editables: public/brand/symbol.svg, wordmark.svg, wordmark-light.svg y favicon.svg. Los wordmarks convierten texto a contornos para no depender de fuentes instaladas. Sprig.astro conserva la geometría editable de origen; Brand.astro usa el mismo símbolo y las fuentes locales.

El script opcional scripts/prepare-brand.py regenera exportaciones con FontTools 4.68.0 y Brotli 1.2.1. No es una dependencia del sitio ni del build habitual.

## Muestra concreta

- Hero con texto a la izquierda, piscina real a la derecha y pequeña fotografía del parque.
- Módulo piloto del departamento de tres ambientes, con información visible, equipamiento desplegable y plano.
- Galerías editoriales tipo masonry con columnas balanceadas automáticamente, alturas naturales, espacios regulares, esquinas cuadradas y PhotoSwipe.
- Header, menú móvil, botones de WhatsApp, contacto y pie como componentes base. En móvil el menú ocupa todo el espacio bajo el header, mantiene marca y botón de cierre a la vista, usa enlaces grandes y cierra con la animación inversa. El pie incluye íconos de Instagram/Facebook y un crédito enlazado a ramita.dev con corazón del mismo color que el nombre.

En escritorio las galerías editoriales se distribuyen en tres columnas; pasan a dos en tablet y una en móvil. Las imágenes mantienen sus proporciones y se amplían sin recortes. El hero permite encuadre editorial manteniendo la fotografía real. La barra de desplazamiento utiliza verde bosque y salvia. El header es algo más bajo (92 px escritorio, 76 px tablet y 68 px móvil), y los enlaces de tipología reutilizan el subrayado animado de la navegación.

## Aprobación y extensión

Actualización solicitada el 01/11/2026: las dos galerías usan tres columnas de ancho calculado a partir de las proporciones de las fotos para cerrar un rectángulo con bordes alineados, sin recortes. El perro queda en la tercera columna de La Paz y la palmera ocupa su lugar anterior. En tablet se usan dos columnas y en móvil una. El header móvil con navegación mejorada permanece fijo al borde superior, incluso al abrir el menú después de hacer scroll.

El usuario aprobó logo, paleta, tipografías, hero, alojamiento y galería en móvil/escritorio. El sistema se extendió a servicios, las tres tipologías, La Paz, normas, ubicación y contacto. Las capturas proposal-* preservan la muestra aprobada; after-* documenta la entrega completa. Todas las fotografías de las unidades aparecen en una tira horizontal; las galerías editoriales muestran todas las imágenes sin reveladores. Las condiciones de convivencia se despliegan por defecto; las normas de mascotas y el equipamiento detallado permanecen en `<details>`. El mapa se muestra activo al cargar la página.
