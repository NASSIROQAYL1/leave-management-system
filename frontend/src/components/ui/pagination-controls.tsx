interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function PaginationControls({ page, totalPages, onPrevious, onNext }: PaginationControlsProps) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page + 1}</span> of{" "}
        <span className="font-medium text-foreground">{Math.max(totalPages, 1)}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 0}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={totalPages <= 0 || page >= totalPages - 1}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
