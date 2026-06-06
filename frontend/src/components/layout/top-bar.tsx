import { useState } from "react";
import { Bell, LogOut, MoonStar, SunMedium } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationStore } from "@/store/notification-store";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export function TopBar() {
  const { resolvedMode, mode, setMode } = useTheme();
  const { user, logout } = useAuth();
  const { items, unreadCount, markAllRead, markRead } = useNotificationStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div>
          <p className="text-sm text-muted-foreground">Leave Management System</p>
          <h1 className="font-heading text-xl font-semibold">Workspace</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:text-foreground"
            aria-label="Toggle theme"
          >
            {resolvedMode === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 inline-flex min-w-5 justify-center rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-border bg-card p-4 shadow-glass">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">In-app updates synced from the backend.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="text-xs font-medium text-primary"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <EmptyState
                      title="No notifications yet"
                      description="Approval updates and workflow events will appear here."
                      compact
                    />
                  ) : (
                    items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void markRead(item.id)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 text-left transition",
                          item.read
                            ? "border-border bg-background/40"
                            : "border-primary/20 bg-primary/5",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                          </div>
                          {!item.read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="hidden items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 md:flex">
              <Avatar name={user.fullName} src={user.profilePicture ?? undefined} size="sm" />
              <div className="text-left">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
