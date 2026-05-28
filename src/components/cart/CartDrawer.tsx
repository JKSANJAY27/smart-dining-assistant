"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, getItemCount, getTotal } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Sticky Bottom Bar (Trigger) - Only shows if items in cart */}
      <AnimatePresence>
        {itemCount > 0 && !isOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md px-3.5 py-3 rounded-2xl glass-strong glow-brand flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 no-min-size">
                <ShoppingBag className="w-5 h-5 no-min-size animate-pulse" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-[hsl(220,18%,11%)] no-min-size">
                  {itemCount}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Your Cart</p>
                <p className="text-[10px] text-orange-400 font-extrabold mt-0.5">{formatPrice(total)}</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleToggle}
              className="gap-1.5 h-9 rounded-xl font-bold bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5 no-min-size" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-Up Bottom Drawer Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={handleToggle}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-t-3xl border-t border-[hsla(220,15%,95%,0.1)] bg-[hsl(220,18%,13%)] shadow-2xl overflow-hidden"
              style={{ maxHeight: "85vh" }}
            >
              {/* Drag Handle indicator */}
              <div 
                onClick={handleToggle}
                className="w-12 h-1.5 bg-[hsla(220,15%,95%,0.15)] rounded-full mx-auto my-2.5 cursor-pointer hover:bg-[hsla(220,15%,95%,0.3)] transition-colors no-min-size" 
                aria-label="Close cart"
              />

              {/* Header */}
              <div className="px-4 pb-3 flex items-center justify-between border-b border-[hsla(220,15%,95%,0.06)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 no-min-size">
                    <ShoppingBag className="w-4 h-4 no-min-size" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Review Order <span className="text-[11px] font-normal text-[hsl(220,10%,55%)] ml-1">({itemCount} items)</span>
                  </h3>
                </div>
                <button
                  onClick={handleToggle}
                  className="w-7 h-7 rounded-full bg-[hsla(220,15%,95%,0.05)] hover:bg-[hsla(220,15%,95%,0.1)] flex items-center justify-center text-[hsl(220,10%,60%)] hover:text-white transition-all no-min-size"
                  aria-label="Close Review"
                >
                  <X className="w-4 h-4 no-min-size" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="px-4 py-4 overflow-y-auto max-h-[45vh] scrollbar-thin">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-2" aria-hidden="true">🛒</p>
                    <p className="text-sm font-semibold text-white">Your cart is empty</p>
                    <p className="text-xs text-[hsl(220,10%,55%)] mt-1">Browse the menu to add delicious items!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {items.map((item) => (
                      <CartItem key={item.menuItem.id} item={item} />
                    ))}
                  </div>
                )}

                {/* Bill details */}
                <CartSummary />
              </div>

              {/* Checkout / Footer Panel */}
              <div className="p-4 border-t border-[hsla(220,15%,95%,0.06)] bg-[hsl(220,18%,11%)]">
                <Button
                  className="w-full h-12 rounded-xl text-sm font-extrabold gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
                  disabled={items.length === 0}
                  onClick={() => {
                    // This will open checkout modal in Phase 9
                    alert("Proceeding to Checkout! OTP verification coming soon.");
                  }}
                >
                  <Sparkles className="w-4 h-4 no-min-size animate-pulse" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 no-min-size ml-auto" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
