export enum ThemeMode {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  verificationStatus?: VerificationStatus;
  phone?: string;
  address?: string;
}

export interface ServiceGalleryItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  durationMins?: number;
  features?: string[];
  agentId: string;
  agentName: string;
  agentImage: string;
  agentSpecialty: string;
  agentLocation?: string;
  gallery?: ServiceGalleryItem[];
}

export interface Agent {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  image: string;
  banner: string;
  bio: string;
  location?: string;
  phone?: string;
  serviceType?: string;
  services: string[];
  gallery: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  verificationStatus: VerificationStatus;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  address: string;
  notes?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  date: string;
  rating: number;
  text: string;
  serviceName: string;
  serviceId?: string;
  customerId?: string;
}

export interface Recommendation {
  id: number | string;
  text: string;
  author: string;
  role: string;
}
