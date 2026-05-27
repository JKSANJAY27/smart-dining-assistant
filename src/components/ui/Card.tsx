import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "elevated" | "glass" | "bordered";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "surface", hover = true, children, ...props }, ref) => {
    const variants = {
      surface: "bg-[hsl(220,18%,11%)] border border-[hsla(220,15%,95%,0.08)]",
      elevated: "bg-[hsl(220,16%,15%)] border border-[hsla(220,15%,95%,0.1)]",
      glass: "glass",
      bordered: "bg-[hsl(220,18%,11%)] border border-[hsla(220,15%,95%,0.15)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          variants[variant],
          hover && [
            "transition-all duration-250 ease-out",
            "hover:border-[hsla(220,15%,95%,0.16)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pb-0", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-4 pb-4 pt-0 flex items-center", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
