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
  email: string;
  company: string;
  isPlayed: boolean;
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

export interface UpdateRewardRequest {
  fullName: string;
  company: string;
  phone: string;
  title: string;
  email: string;
  address: string;
}
