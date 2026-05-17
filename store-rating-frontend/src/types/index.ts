export type UserRole = 'admin' | 'normal_user' | 'store_owner';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt?: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating?: number;
  userRating?: number | null;
  createdAt?: string;
}

export interface Rating {
  id: string;
  value: number;
  user: User;
  store: Store;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface StoreOwnerDashboard {
  store: Store;
  averageRating: number;
  totalRatings: number;
  raters: { userId: string; name: string; email: string; rating: number; ratedAt: string }[];
}
