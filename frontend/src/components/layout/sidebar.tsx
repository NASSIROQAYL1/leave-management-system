import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { menuByRole } from "@/routes/route-config";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const items = menuByRole[user.role];

  return (
    <aside className="hidden w-72 flex-col border-r border-border/70 bg-card/70 px-4 py-5 backdrop-blur-xl lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          LM
        </div>
        <div>
          <p className="font-heading text-lg font-semibold">Leave Management</p>
          <p className="text-sm text-muted-foreground">{user.role.toLowerCase()} workspace</p>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/70 bg-background/70 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} src={user.profilePicture ?? undefined} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
