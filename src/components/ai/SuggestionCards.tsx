"use client";

import Image from "next/image";
import { Plus, Check, Flame } from "lucide-react";
import { useCartActions } from "@/hooks/useCartActions";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@prisma/client";
import { motion } from "framer-motion";

interface SuggestionCardsProps {
  items: MenuItem[];
}

export function SuggestionCards({ items }: SuggestionCardsProps) {
  const { addItem } = useCartActions();
  const { getItemQuantity } = useCartStore();

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 flex gap-4 -mx-1">
      {items.map((item) => {
        const qtyInCart = getItemQuantity(item.id);
        const isAlreadyAdded = qtyInCart > 0;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 w-[215px] rounded-3xl bg-white border border-stone-200/50 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Image header */}
            <div className="relative w-full h-28 bg-stone-50">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="215px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🥘
                </div>
              )}
              {/* Veg / Non-veg indicator absolute badge */}
              <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs border border-stone-200/50 px-2 py-0.5 rounded-full flex items-center gap-1.5 no-min-size shadow-2xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full no-min-size ${
                    item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="text-[8px] text-stone-700 font-extrabold uppercase">
                  {item.isVeg ? "Veg" : "Non-Veg"}
                </span>
              </div>

              {/* Spicy Indicator absolute badge */}
              {item.isSpicy && (
                <div className="absolute top-2.5 right-2.5 z-10 bg-rose-50 border border-rose-200/60 px-1 py-0.5 rounded flex items-center text-rose-500 no-min-size">
                  <Flame className="w-3 h-3 fill-current no-min-size" />
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h5 className="font-extrabold text-stone-900 text-xs leading-snug line-clamp-1">
                  {item.name}
                </h5>
                <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                <span className="text-xs font-black text-stone-900">
                  {formatPrice(Number(item.price))}
                </span>

                <button
                  onClick={() => addItem(item, 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all no-min-size cursor-pointer ${
                    isAlreadyAdded
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs"
                  }`}
                >
                  {isAlreadyAdded ? (
                    <div className="relative">
                      <Check className="w-3.5 h-3.5 no-min-size" />
                      <span className="absolute -top-2.5 -right-2 bg-white text-emerald-600 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-black scale-90 border border-emerald-500">
                        {qtyInCart}
                      </span>
                    </div>
                  ) : (
                    <Plus className="w-3.5 h-3.5 no-min-size" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
