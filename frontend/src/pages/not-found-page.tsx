import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <EmptyState
          title="Page not found"
          description="The requested route is not part of the current workspace."
          action={
            <Link to="/" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Back to workspace
            </Link>
          }
        />
      </div>
    </div>
  );
}
