export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export interface RegisterResponse {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  isRewarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  isRewarded: boolean;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  title: string;
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
}
