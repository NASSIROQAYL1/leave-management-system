import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/ui/page-loader";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types/enums";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const location = useLocation();
  const { initialized, status, user } = useAuthStore();

  if (!initialized || status === "loading") {
    return <PageLoader message="Restoring your workspace..." />;
  }

  if (status !== "authenticated" || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={defaultPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { initialized, status, user } = useAuthStore();
  if (!initialized || status === "loading") {
    return <PageLoader message="Loading session..." />;
  }
  if (status === "authenticated" && user) {
    return <Navigate to={defaultPathForRole(user.role)} replace />;
  }
  return <Outlet />;
}

export function defaultPathForRole(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    default:
      return "/employee/dashboard";
  }
}
