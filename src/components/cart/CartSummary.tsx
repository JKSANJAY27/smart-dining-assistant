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
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/50">
        <Clock className="w-4 h-4 text-[#D97706] shrink-0 no-min-size" />
        <p className="text-[11px] text-gray-800 leading-snug">
          Estimated prep time: <span className="text-gray-950 font-bold">~{estWaitTime} mins</span>
          <span className="text-gray-500 block mt-0.5 font-medium">Freshly prepared on order</span>
        </p>
      </div>

      {/* Bill Details */}
      <div className="space-y-2 rounded-2xl bg-[#FFFDF9] border border-[#F5EFE6] p-4 shadow-xs">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Bill Details
        </h4>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Item Subtotal</span>
          <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-gray-600 flex items-center gap-1">
            GST (5%)
            <span 
              className="text-[10px] text-gray-400 cursor-help no-min-size"
              title="5% Restaurant Service GST"
            >
              <Info className="w-2.5 h-2.5 no-min-size" />
            </span>
          </span>
          <span className="text-gray-900 font-medium">{formatPrice(gst)}</span>
        </div>

        <div className="h-px bg-[#F5EFE6] my-2" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">Grand Total</span>
          <span className="text-base font-black text-[#D97706]">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
