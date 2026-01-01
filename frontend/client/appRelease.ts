// client/appRelease.ts
import { apiGet, apiPost, apiPut, apiDelete, apiGetPublic, apiPatch } from "./http";

/**
 * Interface untuk App Release
 */
export interface AppRelease {
  id: string;
  appName: string;
  platform: "ANDROID" | "IOS";
  versionName: string;
  versionCode: number;
  downloadUrl: string;
  releaseNotes?: string | null;
  isForceUpdate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API untuk Admin / Dashboard
 */
export const adminAppApi = {
  /**
   * List all releases
   */
  listReleases: async (): Promise<AppRelease[]> => {
    const response = await apiGet("/admin/app");
    return response;
  },
  getReleasesActive: async (): Promise<AppRelease[]> => {
    const response = await apiGet("/admin/app/active");
    return response;
  },

  /**
   * Get single release by ID
   */
  getReleaseById: async (id: string): Promise<AppRelease> => {
    const response = await apiGet(`/admin/app/${id}`);
    return response;
  },

  /**
   * Get active release by platform
   */
  getActiveRelease: async (
    platform?: "ANDROID" | "IOS"
  ): Promise<AppRelease> => {
    const url = platform 
      ? `/admin/app/active?platform=${platform}` 
      : "/admin/app/active";
    const response = await apiGetPublic(url);
    return response;
  },

  /**
   * Create new app release
   */
  createRelease: async (data: {
    appName?: string;
    platform: "ANDROID" | "IOS";
    versionName: string;
    versionCode: number;
    downloadUrl: string;
    releaseNotes?: string;
    isForceUpdate?: boolean;
    isActive?: boolean;
  }): Promise<AppRelease> => {
    const response = await apiPost("/admin/app", data);
    return response;
  },

  /**
   * Update existing release
   */
  updateRelease: async (
    id: string,
    data: Partial<{
      appName: string;
      platform: "ANDROID" | "IOS";
      versionName: string;
      versionCode: number;
      downloadUrl: string;
      releaseNotes: string;
      isForceUpdate: boolean;
      isActive: boolean;
    }>
  ): Promise<AppRelease> => {
    const response = await apiPatch(`/admin/app/${id}`, data);
    return response;
  },

  /**
   * Delete release
   */
  deleteRelease: async (id: string): Promise<{ message: string }> => {
    const response = await apiDelete(`/admin/app/${id}`);
    return response;
  },
};