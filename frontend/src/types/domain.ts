import type { LeaveRequestStatus, NotificationType, Role } from "@/types/enums";

export interface DepartmentSummary {
  id: number;
  name: string;
}

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  profilePicture?: string | null;
  role: Role;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profilePicture?: string | null;
  hireDate?: string | null;
  role: Role;
  department?: DepartmentSummary | null;
  manager?: UserSummary | null;
  active: boolean;
  failedLoginAttempts: number;
  accountLockedUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  manager?: UserSummary | null;
  employeeCount: number;
  createdAt: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string | null;
  colorHex: string;
  maxDaysPerYear?: number | null;
  requiresDocument: boolean;
  paid: boolean;
  active: boolean;
  createdAt: string;
}

export interface LeaveBalance {
  id: number;
  user?: UserSummary | null;
  leaveType: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveBalanceSummary {
  leaveTypeId: number;
  leaveTypeName: string;
  colorHex: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveBalanceInitializationResponse {
  year: number;
  createdRecords: number;
}

export interface LeaveRequest {
  id: number;
  employee: UserSummary;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveRequestStatus;
  reason?: string | null;
  attachmentUrl?: string | null;
  manager?: UserSummary | null;
  managerComment?: string | null;
  managerActionDate?: string | null;
  admin?: UserSummary | null;
  adminComment?: string | null;
  adminActionDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PublicHoliday {
  id: number;
  name: string;
  date: string;
  year: number;
  recurring: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  user?: UserSummary | null;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedRequestId?: number | null;
  createdAt: string;
}

export interface NotificationCount {
  count: number;
}

export interface OverlapCheckResponse {
  overlap: boolean;
  workingDays: number;
}

export interface DashboardStats {
  metrics: Record<string, number>;
  recentRequests: LeaveRequest[];
  usersOnLeaveToday: UserSummary[];
  leaveBalances: LeaveBalanceSummary[];
}

export interface CalendarEvent {
  id: number;
  employee: UserSummary;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveRequestStatus;
  label: string;
}

export interface DepartmentLeaveSummary {
  departmentId: number;
  departmentName: string;
  requestCount: number;
  totalDays: number;
}

export interface ReportSummary {
  metrics: Record<string, number>;
  departments: DepartmentLeaveSummary[];
}

export interface EmployeeLeaveReport {
  userId: number;
  employeeName: string;
  departmentName: string;
  requestCount: number;
  totalDaysApproved: number;
  totalDaysPending: number;
  totalDaysRejected: number;
}

export interface FileUploadResponse {
  filename: string;
  url: string;
}
