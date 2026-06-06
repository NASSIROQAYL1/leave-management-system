import { NavLink } from "react-router-dom";
import { menuByRole } from "@/routes/route-config";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <nav className="border-b border-border/70 bg-card/70 px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {menuByRole[user.role].map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
