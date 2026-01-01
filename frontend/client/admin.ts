// client/admin.ts
import { apiGet } from './http';

export const getAdminDashboard = async () => {
  try {
    const response = await apiGet('/admin/dashboard');
    return response;
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    // Jika error karena auth, redirect ke login
    if (error instanceof Error && error.message.includes('401')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    throw error;
  }
};

// Optional: Add retry mechanism
export const getAdminDashboardWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await getAdminDashboard();
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};