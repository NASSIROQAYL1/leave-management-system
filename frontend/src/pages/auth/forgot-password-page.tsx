export function ForgotPasswordPage() {
  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="border-b border-border/70 bg-gradient-to-r from-info/12 via-primary/10 to-background px-8 py-7">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-info/10 text-info">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 18v-6" />
            <path d="M12 8h.01" />
            <path d="M4.93 19.07A10 10 0 1 1 19.07 4.93 10 10 0 0 1 4.93 19.07Z" />
          </svg>
        </div>
        <h1 className="font-heading text-3xl font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The backend reset flow is explicitly deferred in the current repository, so this screen is informational for now.
        </p>
      </div>
      <div className="space-y-4 px-8 py-8">
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
          <p className="font-medium text-warning">Currently unavailable</p>
          <p className="mt-2 text-sm text-muted-foreground">
            `POST /api/auth/forgot-password` currently returns `501 Not Implemented` in the backend.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
          Manual workaround for now: use the seeded credentials from the SQL data or an admin-triggered password reset flow.
        </div>
      </div>
    </div>
  );
}
