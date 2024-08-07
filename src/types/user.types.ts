export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  device?: 'mobile' | 'desktop' | 'tablet';
}

export interface RegisterResponse {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  isRewarded: boolean;
  createdAt: string;
  updatedAt: string;
  isPlayed: boolean;
}

export interface UpdateUserRequest {
  isRewarded: boolean;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  title: string;
  isPlayed: boolean;
  address: string;
  giftId?: number;
  device?: 'mobile' | 'desktop' | 'tablet';
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
  address?: string;
  phone?: string;
  isRewarded?: boolean;
  title?: string;
  isPlayed?: boolean;
}
