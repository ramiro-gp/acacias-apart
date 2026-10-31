# Reglas de trabajo

- Leer PROJECT.md y los documentos de la etapa antes de editar. CONTENT.md es la referencia editorial; actualizar sus registros y los datos tipados en la misma entrega.
- Respetar las aprobaciones del usuario ya recibidas. H2 exige aprobación del sistema visual antes de extenderlo a las secciones restantes. No declarar aprobado un diseño por haber aprobado el plan.
- Conservar originales, PDF, todas las fotografías y capturas ANTES con sus hashes. Nunca alterar evidencia ni incluirla en public/ o dist/.
- Astro estático, TypeScript estricto, Tailwind 4 y scripts nativos. Justificar nuevas dependencias. No React, backend, CMS, reservas, pagos, analítica ni tracking.
- No inventar datos del alojamiento, capacidad, dirección, servicios, precios ni turismo. Revisar CONTENT.md antes de presentar hechos comerciales.
- Todos los enlaces a WhatsApp deben tener su icono reconocible. Enlaces web externos con target="_blank" y rel="noopener noreferrer"; mailto/tel nativos.
- Mantener WCAG 2.2 AA, responsive desde 320 px, orden del DOM y movimiento reducido. Probar cambios de interacción con Playwright y axe.
- Antes de cerrar una entrega: pnpm check, pnpm build, pnpm verify:preservation y las pruebas de interacción afectadas. Registrar resultados y límites en ACCEPTANCE.md.
- Commit y push solo cuando el usuario solicite publicar el código en un repositorio concreto; no forzar pushes ni sobrescribir historia remota. Este encargo autoriza el repositorio indicado en DEPLOYMENT.md. No guardar credenciales.
- No desplegar a Wiroos, cambiar DNS ni modificar la web original sin autorización explícita para esa operación. Todo despliegue Vercel debe respetar las condiciones comerciales del plan y el noindex de esta propuesta.
