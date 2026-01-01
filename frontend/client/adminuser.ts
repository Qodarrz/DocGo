// client/admin.ts - tambahkan fungsi untuk user management
import { apiGet, apiPost, apiPatch, apiDelete } from "./http";

export interface User {
  age: any;
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  role: string;
  userProfile: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isDoctor: boolean;
  doctorInfo?: {
    id: string;
    specialization: string;
    isActive: boolean;
  };
  stats: {
    medicalProfile: boolean;
    diseases: number;
    healthMetrics: number;
    medications: number;
    consultations: number;
    symptomChecks: number;
    emergencyContacts: number;
    deviceTokens: number;
    reminders: number;
  };
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  overview: {
    totalUsers: number;
    totalDoctors: number;
    verifiedUsers: number;
    verificationRate: number;
    todayNewUsers: number;
    activeToday: number;
    activeRate: number;
  };
  distribution: {
    byGender: Record<string, number>;
    byRole: Record<string, number>;
  };
  growth: Array<{
    month: string;
    count: number;
  }>;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  gender?: string;
  emailVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export const adminUserApi = {
  // Get all users with pagination
  getUsers: async (filters: UserFilters = {}): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/adminuser?${queryString}` : "/adminuser";

    return await apiGet(url);
  },

  // Get user by ID
  getUserById: async (id: string) => {
    return await apiGet(`/adminuser/${id}`);
  },

  // Create user
  createUser: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    role?: string;
    emailVerified?: boolean;
  }) => {
    return await apiPost("/adminuser", userData);
  },

  // Update user
  updateUser: async (
    id: string,
    userData: Partial<{
      email: string;
      password: string;
      fullName: string;
      phone: string;
      dateOfBirth: string;
      gender: string;
      role: string;
      emailVerified: boolean;
      userProfile: string;
    }>
  ) => {
    return await apiPatch(`/adminuser/${id}`, userData);
  },

  // Delete user
  deleteUser: async (id: string) => {
    return await apiDelete(`/adminuser/${id}`);
  },

  // Get user statistics
  getUserStats: async (): Promise<{ success: boolean; data: UserStats }> => {
    return await apiGet("/adminuser/stats");
  },

  // Search users
  searchUsers: async (q: string, role?: string) => {
    const params = new URLSearchParams({ q });
    if (role) params.append("role", role);

    return await apiGet(`/adminuser/search?${params.toString()}`);
  },

  // Toggle user verification
  toggleVerification: async (id: string) => {
    return await apiPatch(`/adminuser/${id}/toggle-verification`, {});
  },

  // Get user activity
  getUserActivity: async (id: string, limit = 50) => {
    return await apiGet(`/adminuser/${id}/activity?limit=${limit}`);
  },
};
