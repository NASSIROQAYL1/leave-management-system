import { useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="border-b border-border/70 bg-gradient-to-r from-success/12 via-primary/10 to-background px-8 py-7">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-3xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The backend reset endpoint is present in the API surface but explicitly deferred in the current repository.
        </p>
      </div>
      <div className="space-y-4 px-8 py-8">
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
          <p className="font-medium text-warning">Currently unavailable</p>
          <p className="mt-2 text-sm text-muted-foreground">
            `POST /api/auth/reset-password` currently returns `501 Not Implemented` in the backend.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
          {token
            ? `A reset token is present in the URL, but the backend does not complete the flow yet.`
            : "No reset token was found in the URL."}
        </div>
      </div>
    </div>
  );
}
