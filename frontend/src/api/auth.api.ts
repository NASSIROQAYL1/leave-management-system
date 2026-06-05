import { apiClient } from "@/api/axios";
import type {
  AccessTokenResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  ResetPasswordRequest,
} from "@/types/auth";
import type { ActionResponse } from "@/types/api";
import type { User } from "@/types/domain";

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<AuthResponse>("/api/auth/login", payload);
    return data;
  },
  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post<AccessTokenResponse>("/api/auth/refresh", { refreshToken });
    return data;
  },
  logout: async (payload: LogoutRequest) => {
    const { data } = await apiClient.post<ActionResponse>("/api/auth/logout", payload);
    return data;
  },
  forgotPassword: async (payload: ForgotPasswordRequest) => {
    const { data } = await apiClient.post<ActionResponse>("/api/auth/forgot-password", payload);
    return data;
  },
  resetPassword: async (payload: ResetPasswordRequest) => {
    const { data } = await apiClient.post<ActionResponse>("/api/auth/reset-password", payload);
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get<User>("/api/auth/me");
    return data;
  },
};
