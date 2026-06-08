import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { ProtectedRoute, GuestOnlyRoute, defaultPathForRole } from "@/routes/guards";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { LoginPage } from "@/pages/auth/login-page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password-page";
import { ResetPasswordPage } from "@/pages/auth/reset-password-page";
import { AdminDashboardPage } from "@/pages/admin/admin-dashboard-page";
import { AdminEmployeesPage } from "@/pages/admin/admin-employees-page";
import { AdminEmployeeDetailPage } from "@/pages/admin/admin-employee-detail-page";
import { AdminDepartmentsPage } from "@/pages/admin/admin-departments-page";
import { AdminLeaveTypesPage } from "@/pages/admin/admin-leave-types-page";
import { AdminBalancesPage } from "@/pages/admin/admin-balances-page";
import { AdminRequestsPage } from "@/pages/admin/admin-requests-page";
import { AdminReportsPage } from "@/pages/admin/admin-reports-page";
import { AdminHolidaysPage } from "@/pages/admin/admin-holidays-page";
import { ManagerDashboardPage } from "@/pages/manager/manager-dashboard-page";
import { ManagerRequestsPage } from "@/pages/manager/manager-requests-page";
import { ManagerCalendarPage } from "@/pages/manager/manager-calendar-page";
import { ManagerMyRequestsPage } from "@/pages/manager/manager-my-requests-page";
import { EmployeeDashboardPage } from "@/pages/employee/employee-dashboard-page";
import { EmployeeRequestLeavePage } from "@/pages/employee/employee-request-leave-page";
import { EmployeeMyRequestsPage } from "@/pages/employee/employee-my-requests-page";
import { EmployeeCalendarPage } from "@/pages/employee/employee-calendar-page";
import { EmployeeProfilePage } from "@/pages/employee/employee-profile-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { useAuthStore } from "@/store/auth-store";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? defaultPathForRole(user.role) : "/login"} replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthLayout><Outlet /></AuthLayout>,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout><Outlet /></DashboardLayout>,
        children: [
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: "/admin/dashboard", element: <AdminDashboardPage /> },
              { path: "/admin/employees", element: <AdminEmployeesPage /> },
              { path: "/admin/employees/:id", element: <AdminEmployeeDetailPage /> },
              { path: "/admin/departments", element: <AdminDepartmentsPage /> },
              { path: "/admin/leave-types", element: <AdminLeaveTypesPage /> },
              { path: "/admin/balances", element: <AdminBalancesPage /> },
              { path: "/admin/requests", element: <AdminRequestsPage /> },
              { path: "/admin/reports", element: <AdminReportsPage /> },
              { path: "/admin/holidays", element: <AdminHolidaysPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["MANAGER"]} />,
            children: [
              { path: "/manager/dashboard", element: <ManagerDashboardPage /> },
              { path: "/manager/requests", element: <ManagerRequestsPage /> },
              { path: "/manager/calendar", element: <ManagerCalendarPage /> },
              { path: "/manager/my-requests", element: <ManagerMyRequestsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["EMPLOYEE"]} />,
            children: [
              { path: "/employee/dashboard", element: <EmployeeDashboardPage /> },
              { path: "/employee/request-leave", element: <EmployeeRequestLeavePage /> },
              { path: "/employee/my-requests", element: <EmployeeMyRequestsPage /> },
              { path: "/employee/calendar", element: <EmployeeCalendarPage /> },
              { path: "/employee/profile", element: <EmployeeProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
