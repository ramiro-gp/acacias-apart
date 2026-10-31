import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<ImageMetadata>('../assets/photos/*.{jpg,png}', { eager: true, import: 'default' });
const descriptions: Record<string, string> = {
  'complex-01': 'Piscina cercada y parque arbolado de Acacias Apart',
  'complex-02': 'Jardín de Acacias Apart, con césped, árboles y piscina al fondo',
  'complex-04': 'Fachada de ladrillo de Acacias Apart con vegetación al frente',
  'complex-05': 'Reposeras en el césped junto a la piscina cercada',
  'complex-06': 'Parrilla de mampostería con cubierta metálica en el parque',
  'complex-07': 'Cama matrimonial y paredes de ladrillo en un dormitorio del complejo',
  'complex-08': 'Dormitorio con salida al parque y vista a la piscina',
  'complex-10': 'Toallas blancas sobre una cama junto a la ventana',
  'complex-12': 'Hojas iluminadas por el sol con el parque y la piscina de fondo',
  'complex-13': 'Sendero del parque bajo una pérgola cubierta de vegetación',
  'facade-original': 'Vista del frente de Acacias Apart y su jardín',
  'la-paz-01': 'Árbol y farola junto al agua durante el atardecer',
  'la-paz-02': 'Sol sobre el agua detrás de la silueta de un árbol',
  'la-paz-03': 'Embarcación sobre el agua al atardecer',
  'la-paz-04': 'Lancha en la orilla con el sol al fondo',
  'la-paz-05': 'Cartel de Acacias Apart rodeado de árboles y vegetación',
  'la-paz-06': 'Letras de La Paz frente al agua bajo un cielo con nubes',
  'la-paz-07': 'Playa de arena y estructuras de sombra junto al agua',
  'la-paz-08': 'Costa de arena con estructuras de madera y cielo azul',
  'la-paz-09': 'Embarcación en la orilla bajo un cielo nublado',
  'studio-02': 'Mesa de comedor junto a los ventanales del monoambiente',
  'studio-03': 'Cama matrimonial y paredes de ladrillo en el monoambiente',
  'studio-04': 'Cama, ventana y sector de comedor del monoambiente',
  'studio-05': 'Cocina del monoambiente con mesada, alacenas y heladera',
  'studio-07': 'Salida del monoambiente hacia el parque con vista a la piscina',
  'three-room-20210816_165107': 'Segundo dormitorio de tres ambientes con camas individuales y aire acondicionado',
  'three-room-20210816_165421': 'Cocina de tres ambientes con mesada, microondas y electrodomésticos',
  'three-room-20210816_170252': 'Estar de tres ambientes con mesa de comedor, sofá y salida al parque',
  'three-room-20210816_170332': 'Vista desde la cocina hacia el comedor del departamento de tres ambientes',
  'three-room-20210817_094152': 'Dormitorio matrimonial de tres ambientes con iluminación cálida',
  'two-room-01': 'Dormitorio de dos ambientes con cama matrimonial e individual',
  'two-room-02': 'Mesa de comedor con flores en el departamento de dos ambientes',
  'two-room-03': 'Estar de dos ambientes con sofá y mesa de comedor',
  'two-room-04': 'Baño de dos ambientes con ducha y revestimiento cerámico',
  'two-room-05': 'Vista del estar, comedor y cocina del departamento de dos ambientes',
  'two-room-06': 'Cocina de dos ambientes con horno, heladera y microondas',
};

export const photos = Object.entries(modules).map(([file, image]) => {
  const id = file.split('/').at(-1)!.replace(/\.(jpg|png)$/, '');
  const alt = descriptions[id];
  if (!alt) throw new Error(`Falta revisar el alt de ${id}`);
  return { id, image, alt };
});

export function photo(id: string) {
  const result = photos.find(item => item.id === id);
  if (!result) throw new Error(`Fotografía no encontrada: ${id}`);
  return result;
}

export const complexPhotoIds = ['complex-02', 'complex-01', 'complex-04', 'complex-12', 'complex-05', 'complex-06', 'complex-07', 'complex-08', 'complex-10', 'complex-13', 'facade-original'];
export const destinationPhotoIds = ['la-paz-03', 'la-paz-06', 'la-paz-01', 'la-paz-02', 'la-paz-04', 'la-paz-05', 'la-paz-07', 'la-paz-08', 'la-paz-09'];
