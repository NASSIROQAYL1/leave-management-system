export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED_BY_MANAGER"
  | "REJECTED_BY_MANAGER"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type ThemeMode = "light" | "dark" | "system";
