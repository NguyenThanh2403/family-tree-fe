/**
 * Core data types for the Family Tree application.
 * These types are platform-agnostic and can be shared with React Native later.
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  occupation?: string;
  bio?: string;
  avatarUrl?: string;
  parentId?: string;
  spouseId?: string;
  generation: number;
}

export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  originPlace?: string;
  members: FamilyMember[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
