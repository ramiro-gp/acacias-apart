import type { Accommodation } from './types';

const common = [
  'Baño amplio con ducha, toallas y secador de pelo.',
  'Termotanque independiente.', 'Wifi.', 'Parrilla compartida.',
  'Servicio de sábanas y toallas.',
];

export const accommodations: Accommodation[] = [
  {
    id: 'three-room', name: 'Tres ambientes', area: 40, capacity: 5, bedrooms: 2,
    summary: 'Dos dormitorios independientes y un estar para compartir.',
    distribution: ['Estar con sofá cama.', 'Comedor para cinco personas.', 'Dormitorio con cama matrimonial, ropa blanca, amplio guardado y aire acondicionado.', 'Dormitorio con cama rinconera, ropa blanca, amplio guardado y aire acondicionado.'],
    equipment: ['Cocina con vajilla completa, heladera, cocina con horno, microondas, pava eléctrica y cafetera eléctrica.', ...common, '2 (dos) TV LCD con programación por cable y DVD. Una de las TV se encuentra en la habitación con cama matrimonial.', 'Aire acondicionado frío/calor.', 'Cuna a solicitud del cliente.'],
    pets: false,
    photos: ['three-room-20210816_170252', 'three-room-20210816_165107', 'three-room-20210816_165421', 'three-room-20210816_170332', 'three-room-20210817_094152'],
    plan: '/img/PLANO%20DEPARTAMENTO%201.pdf', contentStatus: 'owner-confirmed',
  },
  {
    id: 'two-room', name: 'Dos ambientes', area: 40, capacity: 5, bedrooms: 1,
    summary: 'Un dormitorio independiente y estar con sofá cama.',
    distribution: ['Estar con sofá cama y aire acondicionado frío/calor.', 'Comedor para cinco personas.', 'Dormitorio con cama matrimonial, cama individual, ropa blanca, amplio guardado y aire acondicionado.'],
    equipment: ['Cocina con vajilla completa, heladera, cocina con horno, microondas y cafetera eléctrica.', ...common, 'TV LCD con programación por cable y DVD.', 'Calefacción por tiro balanceado y aire acondicionado frío/calor.', 'Cuna a solicitud del cliente.'],
    pets: true, photos: ['two-room-01', 'two-room-02', 'two-room-03', 'two-room-04', 'two-room-05', 'two-room-06'],
    plan: '/img/PLANO%20DEPARTAMENTO%202.pdf', contentStatus: 'owner-confirmed',
  },
  {
    id: 'studio', name: 'Monoambiente', area: 16, capacity: null, bedrooms: null,
    summary: 'Un ambiente con cama matrimonial y cocina equipada.',
    distribution: ['Cama matrimonial, ropa blanca y espacio de guardado.'],
    equipment: ['Cocina con vajilla completa, heladera, anafe a gas, horno eléctrico y cafetera eléctrica.', ...common, 'TV LCD con programación por cable.', 'Aire acondicionado frío/calor y calefacción por aire acondicionado.'],
    pets: true, photos: ['studio-02', 'studio-03', 'studio-04', 'studio-05', 'studio-07'],
    plan: '/img/PLANO%20DORMI.pdf', contentStatus: 'owner-confirmed',
  },
];
