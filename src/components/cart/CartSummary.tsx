"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Clock, Info } from "lucide-react";
import { useMemo } from "react";

export function CartSummary() {
  const { items, getSubtotal, getGST, getTotal } = useCartStore();
  const subtotal = getSubtotal();
  const gst = getGST();
  const total = getTotal();

  // Estimate prep time based on maximum prep time in cart
  const estWaitTime = useMemo(() => {
    if (items.length === 0) return 0;
    const maxPrep = Math.max(...items.map((i) => i.menuItem.prepTime || 15));
    // If multiple items, add a tiny buffer (3 min per additional unique item)
    const buffer = (items.length - 1) * 3;
    return maxPrep + buffer;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 pt-3">
      {/* Dynamic Wait Time Estimate */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[hsla(45,96%,64%,0.06)] border border-[hsla(45,96%,64%,0.15)]">
        <Clock className="w-4 h-4 text-yellow-400 shrink-0 no-min-size" />
        <p className="text-[11px] text-[hsl(220,10%)] leading-snug">
          Estimated prep time: <span className="text-white font-bold">~{estWaitTime} mins</span>
          <span className="text-[hsl(220,10%,55%)] block mt-0.5">Freshly prepared on order</span>
        </p>
      </div>

      {/* Bill Details */}
      <div className="space-y-2 rounded-xl bg-[hsl(220,18%,11%)] border border-[hsla(220,15%,95%,0.04)] p-3">
        <h4 className="text-[11px] font-bold text-[hsl(220,10%,55%)] uppercase tracking-wider mb-2">
          Bill Details
        </h4>
        
        <div className="flex justify-between text-xs">
          <span className="text-[hsl(220,10%,60%)]">Item Subtotal</span>
          <span className="text-white font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-[hsl(220,10%,60%)] flex items-center gap-1">
            GST (5%)
            <span 
              className="text-[10px] text-[hsl(220,10%,45%)] cursor-help no-min-size"
              title="5% Restaurant Service GST"
            >
              <Info className="w-2.5 h-2.5 no-min-size" />
            </span>
          </span>
          <span className="text-white font-medium">{formatPrice(gst)}</span>
        </div>

        <div className="h-px bg-[hsla(220,15%,95%,0.06)] my-2" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-white">Grand Total</span>
          <span className="text-base font-black text-orange-400">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
