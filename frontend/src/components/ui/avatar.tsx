import { cn } from "@/lib/cn";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (src) {
    return <img src={src} alt={name} className={cn("rounded-full object-cover", sizeClasses[size])} />;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        sizeClasses[size],
      )}
    >
      {initials || "U"}
    </div>
  );
}
