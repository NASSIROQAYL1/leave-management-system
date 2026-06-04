import type { DepartmentSummary, User, UserSummary } from "@/types/domain";
import type { Role } from "@/types/enums";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthSessionUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: Role;
  department?: DepartmentSummary | null;
  manager?: UserSummary | null;
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthSessionUser;
}

export interface AccessTokenResponse {
  accessToken: string;
}
