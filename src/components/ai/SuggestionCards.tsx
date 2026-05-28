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
    <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 flex gap-3.5 -mx-1">
      {items.map((item) => {
        const qtyInCart = getItemQuantity(item.id);
        const isAlreadyAdded = qtyInCart > 0;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 w-[190px] rounded-xl bg-[hsl(220,16%,14%)] border border-[hsla(220,15%,95%,0.06)] overflow-hidden shadow-md flex flex-col justify-between"
          >
            {/* Image header */}
            <div className="relative w-full h-24 bg-[hsl(220,18%,11%)]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="190px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  🥘
                </div>
              )}
              {/* Veg / Non-veg indicator absolute badge */}
              <div className="absolute top-2 left-2 z-10 bg-[hsl(220,20%,7%,0.75)] backdrop-blur px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full no-min-size ${
                    item.isVeg ? "bg-emerald-400" : "bg-rose-500"
                  }`}
                />
                <span className="text-[8px] text-[hsl(220,10%,75%)] font-bold uppercase">
                  {item.isVeg ? "Veg" : "Non-Veg"}
                </span>
              </div>

              {/* Spicy Indicator absolute badge */}
              {item.isSpicy && (
                <div className="absolute top-2 right-2 z-10 bg-orange-500/25 border border-orange-500/35 px-1 py-0.5 rounded flex items-center text-orange-400 no-min-size">
                  <Flame className="w-2.5 h-2.5 fill-current no-min-size" />
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-white text-[11px] leading-snug line-clamp-1">
                  {item.name}
                </h5>
                <p className="text-[9px] text-[hsl(220,8%,55%)] line-clamp-2 mt-1 leading-normal">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[hsla(220,15%,95%,0.04)]">
                <span className="text-xs font-extrabold text-white">
                  {formatPrice(Number(item.price))}
                </span>

                <button
                  onClick={() => addItem(item, 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all no-min-size ${
                    isAlreadyAdded
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]"
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
