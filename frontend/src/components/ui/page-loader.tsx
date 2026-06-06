interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading workspace..." }: PageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass-card flex max-w-sm flex-col items-center px-8 py-10 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-5 font-medium">{message}</p>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while the application restores state.</p>
      </div>
    </div>
  );
}
