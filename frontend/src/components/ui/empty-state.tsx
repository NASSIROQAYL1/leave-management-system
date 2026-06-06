import type { ReactNode } from "react";
import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={compact ? "rounded-2xl border border-dashed border-border p-4 text-center" : "glass-card flex flex-col items-center px-6 py-10 text-center"}>
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileSearch className="h-5 w-5" />
      </div>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
