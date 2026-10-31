export const releaseReady = import.meta.env.SITE_RELEASE === 'true';
export const currentYear = () => new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric' }).format(new Date());
export const site = {
  name: 'Acacias Apart',
  locality: 'La Paz',
  region: 'Entre Ríos',
  country: 'Argentina',
  canonical: 'https://www.acaciasapart.com.ar/',
  email: 'acaciaslapaz@yahoo.com.ar',
  phoneDisplay: '011 15-6142-6804',
  phoneInternational: '+5491161426804',
  whatsappNumber: '5491161426804',
  whatsappConfirmed: true,
  whatsappConfirmation: 'Confirmado por el usuario en esta conversación el 31/10/2026.',
  instagram: 'https://www.instagram.com/apartacacias',
  facebook: 'https://www.facebook.com/acaciasapartlapaz',
  address: null,
  mapsUrl: 'https://www.google.com/maps?cid=5122776448601849891',
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3428.7621475916794!2d-59.653101!3d-30.753182000000002!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b34df77fd52629%3A0x4717c209d2a68023!2sAcacias%20Apart!5e0!3m2!1ses!2sar!4v1793462188599!5m2!1ses!2sar',
  releaseReady,
} as const;

export const whatsappUrl = (message = 'Hola, quisiera consultar disponibilidad en Acacias Apart.') =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const generalServices = [
  'Aire acondicionado', 'Mascotas en dos ambientes y monoambiente', 'Piscina',
  'Parque y parrillas', 'Servicio de ropa blanca', 'Cámaras de seguridad',
  'Conexión wifi', 'Cuna para bebés a solicitud', 'Estacionamiento',
];

export const commercialPolicies = [
  'Entrada: 12:00 hs. Salida: 10:00 hs. Consultar la posibilidad de late check out.',
  'Estacionamiento: espacio incluido dentro del predio, cubierto para departamentos de dos y tres ambientes.',
  'Internet: wifi gratuito.',
  'Formas de pago: efectivo o transferencia bancaria.',
  'Política de mascotas: consultar el reglamento.',
  'Las instalaciones son de uso exclusivo de los huéspedes del complejo.',
  'No se permiten visitas.',
];

export const petPolicies = [
  'La mascota debe estar siempre acompañada por alguno de sus dueños. No debe quedar sola dentro ni fuera del departamento.',
  'Cualquier daño que ocasione la mascota en el complejo deberá ser asumido por sus dueños.',
  'Los dueños se comprometen a que la mascota no ocasione molestias a los demás huéspedes, especialmente en horarios de descanso.',
  'No está permitido utilizar ropa del alojamiento para la mascota, como toallas o frazadas.',
  'No se permite que la mascota se suba a los sillones o camas.',
  'La mascota debe llevar un identificador con los datos de sus dueños.',
  'Las mascotas solo están permitidas en el departamento de dos ambientes y en el monoambiente.',
];

// Registro histórico privado; el usuario autorizó retirarlos de la nueva interfaz.
export const legacyContent = {
  covidNotice: 'Servicios sujetos a disposiciones gubernamentales sanitarias por prevención Covid-19',
  copyright: '© 2021 Acacias Apart',
  safeTravelsStatus: 'removed-from-interface-owner-confirmed',
} as const;
