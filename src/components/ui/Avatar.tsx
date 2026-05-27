import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  src?: string;
  alt?: string;
  fallback?: string;
  online?: boolean;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", src, alt, fallback, online, ...props }, ref) => {
    const initials = fallback
      ? fallback
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

    // Generate a consistent gradient from the fallback string
    const gradients = [
      "from-orange-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-blue-500 to-indigo-500",
      "from-violet-500 to-purple-500",
      "from-amber-500 to-orange-500",
      "from-pink-500 to-rose-500",
    ];
    const gradientIndex = fallback
      ? fallback.charCodeAt(0) % gradients.length
      : 0;
    const gradient = gradients[gradientIndex];

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-full shrink-0 no-min-size",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || fallback || "Avatar"}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center",
              "font-bold text-white",
              gradient
            )}
          >
            {initials}
          </div>
        )}
        {online !== undefined && (
          <span
            className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[hsl(220,20%,7%)]",
              "no-min-size",
              online ? "bg-emerald-400" : "bg-zinc-500"
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
