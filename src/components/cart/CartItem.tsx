"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, Edit, Check } from "lucide-react";
import type { CartItem as StoreCartItem } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { useCartActions } from "@/hooks/useCartActions";
import { formatPrice } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface CartItemProps {
  item: StoreCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartActions();
  const { updateInstructions } = useCartStore(); // Keep instructions update on store directly for local input state
  const [instructions, setInstructions] = useState(item.specialInstructions || "");
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  const handleSaveInstructions = () => {
    updateInstructions(item.menuItem.id, instructions);
    setIsEditingInstructions(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="p-3.5 rounded-xl bg-[hsl(220,18%,11%)] border border-[hsla(220,15%,95%,0.06)] mb-3"
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[hsl(220,16%,13%)]">
          {item.menuItem.imageUrl ? (
            <Image
              src={item.menuItem.imageUrl}
              alt={item.menuItem.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              🍽️
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-white text-xs leading-snug line-clamp-1">
              {item.menuItem.name}
            </h4>
            <p className="text-xs font-bold text-white shrink-0">
              {formatPrice(Number(item.menuItem.price) * item.quantity)}
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] text-[hsl(220,10%,55%)] capitalize">
              {item.menuItem.category}
            </span>
            <span className="text-[10px] text-[hsl(220,10%,45%)]">•</span>
            <div className="flex items-center gap-1 bg-[hsla(220,15%,95%,0.04)] px-1.5 py-0.5 rounded-full border border-[hsla(220,15%,95%,0.04)]">
              <Avatar 
                size="xs" 
                fallback={item.addedBy} 
                className="w-3.5 h-3.5 text-[7px] font-bold" 
              />
              <span className="text-[9px] text-[hsl(220,10%,65%)] font-semibold capitalize">
                {item.addedBy}
              </span>
            </div>
          </div>

          {/* Special instructions display */}
          <div className="mt-1.5 flex items-center gap-1.5 min-h-[1.5rem]">
            {isEditingInstructions ? (
              <div className="flex items-center gap-1.5 w-full mt-1">
                <input
                  type="text"
                  placeholder="E.g., No onion, extra spicy..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="flex-1 bg-[hsl(220,16%,15%)] text-[11px] text-white px-2 py-1 rounded border border-[hsla(220,15%,95%,0.1)] focus:outline-none focus:border-orange-500 h-7"
                />
                <button
                  onClick={handleSaveInstructions}
                  className="w-7 h-7 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-white rounded transition-colors no-min-size"
                >
                  <Check className="w-3.5 h-3.5 no-min-size" />
                </button>
              </div>
            ) : (
              <>
                {item.specialInstructions ? (
                  <p className="text-[10px] text-orange-400 italic line-clamp-1 flex-1">
                    &ldquo;{item.specialInstructions}&rdquo;
                  </p>
                ) : (
                  <button
                    onClick={() => setIsEditingInstructions(true)}
                    className="text-[10px] text-[hsl(220,10%,50%)] hover:text-white transition-colors flex items-center gap-1 no-min-size"
                  >
                    <Edit className="w-2.5 h-2.5 no-min-size" />
                    <span>Add special instructions</span>
                  </button>
                )}
                {item.specialInstructions && (
                  <button
                    onClick={() => {
                      setInstructions(item.specialInstructions || "");
                      setIsEditingInstructions(true);
                    }}
                    className="text-[10px] text-[hsl(220,10%,50%)] hover:text-white transition-colors no-min-size shrink-0 ml-auto"
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[hsla(220,15%,95%,0.04)]">
        <button
          onClick={() => removeItem(item.menuItem.id)}
          className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-400 transition-colors no-min-size"
        >
          <Trash2 className="w-3 h-3 no-min-size" />
          <span>Remove</span>
        </button>

        {/* Stepper */}
        <div className="flex items-center gap-2 bg-[hsl(220,16%,15%)] border border-[hsla(220,15%,95%,0.05)] rounded-lg px-0.5">
          <button
            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-colors no-min-size"
          >
            <Minus className="w-3 h-3 no-min-size" />
          </button>
          <span className="text-[11px] font-bold text-white min-w-[1rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-colors no-min-size"
          >
            <Plus className="w-3 h-3 no-min-size" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
