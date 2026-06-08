import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  FileBarChart2,
  FilePlus2,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  ListTodo,
  Settings2,
  Users,
} from "lucide-react";
import type { Role } from "@/types/enums";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const menuByRole: Record<Role, MenuItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/admin/employees", icon: Users },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Leave Types", href: "/admin/leave-types", icon: FolderKanban },
    { label: "Balances", href: "/admin/balances", icon: Gauge },
    { label: "Requests", href: "/admin/requests", icon: ListTodo },
    { label: "Reports", href: "/admin/reports", icon: FileBarChart2 },
    { label: "Holidays", href: "/admin/holidays", icon: CalendarDays },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Approvals", href: "/manager/requests", icon: ListTodo },
    { label: "Team Calendar", href: "/manager/calendar", icon: CalendarDays },
    { label: "My Requests", href: "/manager/my-requests", icon: FilePlus2 },
  ],
  EMPLOYEE: [
    { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
    { label: "Request Leave", href: "/employee/request-leave", icon: FilePlus2 },
    { label: "My Requests", href: "/employee/my-requests", icon: ListTodo },
    { label: "Calendar", href: "/employee/calendar", icon: CalendarDays },
    { label: "Profile", href: "/employee/profile", icon: Settings2 },
  ],
};
