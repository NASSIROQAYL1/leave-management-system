import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";
import type { AccessTokenResponse } from "@/types/auth";

const REFRESH_URL = `${env.apiUrl}/api/auth/refresh`;
let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRefreshRequest = requestUrl.includes("/api/auth/refresh");
    const isPublicAuthRequest =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/forgot-password") ||
      requestUrl.includes("/api/auth/reset-password");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRefreshRequest ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error);
    }

    const state = useAuthStore.getState();
    if (!state.refreshToken) {
      state.clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post<AccessTokenResponse>(REFRESH_URL, { refreshToken: state.refreshToken })
        .then((response) => {
          const accessToken = response.data.accessToken;
          useAuthStore.getState().updateAccessToken(accessToken);
          return accessToken;
        })
        .catch(() => {
          useAuthStore.getState().clearSession();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  },
);
