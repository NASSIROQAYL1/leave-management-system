import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { env } from "@/lib/env";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 text-slate-100 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_24%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            LM
          </div>
          <div>
            <div className="font-heading text-lg font-semibold">{env.appName}</div>
            <div className="text-sm text-slate-300">Secure leave workflows for admins, managers, and employees.</div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-auto max-w-lg space-y-6"
        >
          <h1 className="font-heading text-4xl font-semibold leading-tight">
            Modern leave operations with a single source of truth.
          </h1>
          <p className="text-base text-slate-300">
            Track balances, route approvals, publish holidays, and keep every absence visible across the company.
          </p>
        </motion.div>
      </div>
      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
