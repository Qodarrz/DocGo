// client/admin.ts


import { apiGet, apiPost, apiPatch, apiDelete } from './http';

export interface Doctor {
  id: string;
  userId: string;
  image: string;
  specialization: string;
  licenseNumber?: string;
  experienceYear?: number;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    phone?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    role: 'DOCTOR';
    createdAt: string;
    userProfile?: string;
  };
  _count?: {
    consultations: number;
    chatRooms: number;
  };
}

export interface CreateDoctorData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  specialization: string;
  licenseNumber?: string;
  experienceYear?: number;
  bio?: string;
  isActive?: boolean;
  image?: File;
}

export interface UpdateDoctorData {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  specialization?: string;
  licenseNumber?: string;
  experienceYear?: number;
  bio?: string;
  isActive?: boolean;
  email?: string;
  password?: string;
  image?: File;
}

export interface DoctorsResponse {
  success: boolean;
  data: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DoctorStats {
  consultationStats: {
    pending?: number;
    ongoing?: number;
    completed?: number;
    cancelled?: number;
  };
  totalConsultations: number;
  recentConsultations: number;
  activeChatRooms: number;
  completionRate: string;
  experienceYears: number;
}

// Get all doctors with pagination
export const getDoctors = async (
  page = 1,
  limit = 10,
  search = '',
  specialization?: string,
  isActive?: boolean,
  sortBy = 'createdAt',
  sortOrder = 'desc'
): Promise<DoctorsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(specialization && { specialization }),
      ...(isActive !== undefined && { isActive: isActive.toString() }),
      sortBy,
      sortOrder,
    });

    const response = await apiGet(`/admin/doctors?${params}`);
    return response;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Get single doctor by ID
export const getDoctorById = async (id: string): Promise<{ success: boolean; data: Doctor }> => {
  try {
    const response = await apiGet(`/admin/doctors/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

// Create new doctor
export const createDoctor = async (data: FormData): Promise<{ success: boolean; data: Doctor }> => {
  try {
    const response = await apiPost('/admin/doctors', data);
    return response;
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
};

// Update doctor
export const updateDoctor = async (
  id: string,
  data: FormData
): Promise<{ success: boolean; data: Doctor }> => {
  try {
    const response = await apiPatch(`/admin/doctors/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

// Delete doctor
export const deleteDoctor = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiDelete(`/admin/doctors/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};

// Get doctor statisticss
export const getDoctorStats = async (id: string): Promise<{ success: boolean; data: DoctorStats }> => {
  try {
    const response = await apiGet(`/admin/doctors/${id}/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    throw error;
  }
};

// Search doctors
export const searchDoctors = async (query: string): Promise<{ success: boolean; data: Doctor[] }> => {
  try {
    const response = await apiGet(`/admin/doctors/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw error;
  }
};

// Get available doctors
export const getAvailableDoctors = async (
  specialization?: string,
  date?: string
): Promise<{ success: boolean; data: any[] }> => {
  try {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (date) params.append('date', date);
    
    const response = await apiGet(`/admin/doctors/available?${params}`);
    return response;
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    throw error;
  }
};