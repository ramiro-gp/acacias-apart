export type ContentStatus = 'published-unverified' | 'owner-confirmed';

export interface Accommodation {
  id: 'three-room' | 'two-room' | 'studio';
  name: string;
  area: number;
  capacity: number | null;
  bedrooms: number | null;
  summary: string;
  distribution: string[];
  equipment: string[];
  pets: boolean;
  photos: string[];
  plan: string;
  contentStatus: ContentStatus;
}

export interface PhotoRecord {
  id: string;
  source: string;
  file: string;
  category: 'complex' | 'three-room' | 'two-room' | 'studio' | 'la-paz' | 'facade';
  width: number;
  height: number;
  alt: string | null;
  altReviewed: boolean;
}
