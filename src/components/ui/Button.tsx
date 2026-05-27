import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(220,20%,7%)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none relative overflow-hidden rounded-xl",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-orange-500 to-rose-500 text-white",
          "shadow-[0_0_20px_hsla(24,95%,53%,0.3)]",
          "hover:shadow-[0_0_28px_hsla(24,95%,53%,0.5)] hover:brightness-110",
        ].join(" "),
        secondary: [
          "bg-[hsl(220,16%,15%)] text-[hsl(220,15%,95%)] border border-[hsla(220,15%,95%,0.12)]",
          "hover:border-[hsla(220,15%,95%,0.25)] hover:bg-[hsl(220,16%,18%)]",
        ].join(" "),
        ghost: [
          "text-[hsl(220,10%,65%)] hover:text-[hsl(220,15%,95%)]",
          "hover:bg-[hsla(220,15%,95%,0.06)]",
        ].join(" "),
        accent: [
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
          "shadow-[0_0_20px_hsla(162,73%,46%,0.3)]",
          "hover:shadow-[0_0_28px_hsla(162,73%,46%,0.5)] hover:brightness-110",
        ].join(" "),
        outline: [
          "border border-[hsla(220,15%,95%,0.2)] text-[hsl(220,15%,95%)]",
          "hover:bg-[hsla(220,15%,95%,0.06)] hover:border-[hsla(220,15%,95%,0.35)]",
        ].join(" "),
        danger: [
          "bg-gradient-to-r from-red-600 to-rose-600 text-white",
          "hover:brightness-110",
        ].join(" "),
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-lg min-w-[2rem]",
        sm: "h-9 px-4 text-sm min-w-[2.25rem]",
        md: "h-11 px-5 text-sm min-w-[2.75rem]",
        lg: "h-12 px-7 text-base min-w-[3rem]",
        xl: "h-14 px-8 text-lg min-w-[3.5rem]",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0 rounded-lg",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
