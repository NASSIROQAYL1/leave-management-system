import { cn } from "@/lib/cn";

interface LeaveBalanceRingProps {
  label: string;
  total: number;
  remaining: number;
  used: number;
  colorHex: string;
  className?: string;
}

export function LeaveBalanceRing({
  label,
  total,
  remaining,
  used,
  colorHex,
  className,
}: LeaveBalanceRingProps) {
  const safeTotal = total > 0 ? total : 1;
  const progress = Math.min(Math.max(used / safeTotal, 0), 1);
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={cn("glass-card flex flex-col items-center gap-4 p-5", className)}>
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" className="text-muted/70" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={colorHex}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-heading text-2xl font-semibold">{remaining}</p>
          <p className="text-xs text-muted-foreground">remaining</p>
        </div>
      </div>
      <div className="text-center">
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {used} used of {total} total
        </p>
      </div>
    </div>
  );
}
