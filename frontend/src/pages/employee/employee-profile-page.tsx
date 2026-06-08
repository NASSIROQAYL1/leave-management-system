import { format, parseISO } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/store/auth-store";

export function EmployeeProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <section className="space-y-6">
        <PageHeader title="Profile" description="Your account information and current access details." />
        <EmptyState title="Profile unavailable" description="Sign in again to restore your account session." />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Profile"
        description="Review your account details, reporting line, and current access state."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.fullName} src={user.profilePicture ?? undefined} size="lg" />
            <div>
              <h2 className="font-heading text-2xl font-semibold">{user.fullName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {user.role}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
              <p className="mt-2 text-sm font-medium">{user.department?.name ?? "Not assigned"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Manager</p>
              <p className="mt-2 text-sm font-medium">{user.manager?.fullName ?? "No manager assigned"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
              <p className="mt-2 text-sm font-medium">{user.phone || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-heading text-xl font-semibold">Account details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Hire date</p>
                <p className="mt-2 text-sm font-medium">
                  {user.hireDate ? format(parseISO(user.hireDate), "MMM d, yyyy") : "Not recorded"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Account status</p>
                <p className="mt-2 text-sm font-medium">{user.active ? "Active" : "Inactive"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
                <p className="mt-2 text-sm font-medium">{format(parseISO(user.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Failed login attempts</p>
                <p className="mt-2 text-sm font-medium">{user.failedLoginAttempts}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-heading text-xl font-semibold">Profile editing status</h2>
            <div className="mt-4 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3">
              <p className="font-medium text-warning">Editing is not exposed by the current backend API</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The repository currently supports `auth/me` for profile viewing, while self-service profile update and password-change endpoints are not implemented yet.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                This page is intentionally read-only in Phase 12 so the frontend stays aligned with the repository contracts instead of inventing unsupported profile mutations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
