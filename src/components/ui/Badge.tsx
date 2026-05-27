import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 select-none no-min-size",
  {
    variants: {
      variant: {
        default: "bg-[hsla(220,15%,95%,0.1)] text-[hsl(220,10%,65%)] border border-[hsla(220,15%,95%,0.1)]",
        brand: "bg-[hsla(24,95%,53%,0.15)] text-orange-400 border border-[hsla(24,95%,53%,0.25)]",
        accent: "bg-[hsla(162,73%,46%,0.15)] text-emerald-400 border border-[hsla(162,73%,46%,0.25)]",
        gold: "bg-[hsla(45,96%,64%,0.15)] text-yellow-400 border border-[hsla(45,96%,64%,0.25)]",
        rose: "bg-[hsla(340,82%,57%,0.15)] text-rose-400 border border-[hsla(340,82%,57%,0.25)]",
        veg: "bg-[hsla(142,71%,45%,0.15)] text-green-400 border border-[hsla(142,71%,45%,0.25)]",
        "non-veg": "bg-[hsla(0,72%,51%,0.15)] text-red-400 border border-[hsla(0,72%,51%,0.25)]",
        spicy: "bg-[hsla(15,95%,60%,0.15)] text-orange-300 border border-[hsla(15,95%,60%,0.25)]",
        bestseller: "bg-gradient-to-r from-[hsla(45,96%,64%,0.2)] to-[hsla(24,95%,53%,0.2)] text-yellow-300 border border-[hsla(45,96%,64%,0.3)]",
        "chef-special": "bg-gradient-to-r from-[hsla(162,73%,46%,0.2)] to-[hsla(217,91%,60%,0.2)] text-emerald-300 border border-[hsla(162,73%,46%,0.3)]",
        warning: "bg-[hsla(38,92%,50%,0.15)] text-amber-400 border border-[hsla(38,92%,50%,0.25)]",
        error: "bg-[hsla(0,72%,51%,0.15)] text-red-400 border border-[hsla(0,72%,51%,0.25)]",
        success: "bg-[hsla(142,71%,45%,0.15)] text-green-400 border border-[hsla(142,71%,45%,0.25)]",
        live: [
          "bg-[hsla(142,71%,45%,0.15)] text-green-400 border border-[hsla(142,71%,45%,0.25)]",
          "before:content-[''] before:inline-block before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-400 before:animate-pulse",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {children}
    </span>
  );
}
