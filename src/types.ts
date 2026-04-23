export type TransactionType = 'compra' | 'aluguel';
export type PropertyType = 'apartamento' | 'casa' | 'comercial' | 'terreno' | 'Design' | 'Villa';

export interface Property {
  id: string;
  neg?: TransactionType;
  title: string;
  desc: string;
  price: number;
  location: string;
  neighborhood: string;
  address?: string;
  beds: number;
  baths: number;
  sqft: number;
  garage: number;
  tipo: string;
  tag: string;
  image: string;
  images: string[];
  videoUrl: string;
  latitude?: number;
  longitude?: number;
  luxury_flag?: boolean;
  status?: 'available' | 'sold' | 'reserved';
  area_m2?: number;
  isUnlisted?: boolean;
  createdAt?: number;
  updatedAt?: number;
  features?: string[];
  isFeatured?: boolean;
}

export interface Testimonial {
  id: number;
  init: string;
  nome: string;
  role: string;
  data: string;
  stars: number;
  caseTitle: string;
  text: string;
  image?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface MatchProfile {
  lifestyle: string;
  family: string;
  investmentGoal: string;
  preferredVibe: string;
}
