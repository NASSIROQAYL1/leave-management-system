import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="page-shell">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <MobileNav />
        <main className="page-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
