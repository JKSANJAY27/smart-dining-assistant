"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/Button";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
              <ArrowRight className="w-4 h-4 no-min-size" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleToggle}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[hsl(220,18%,11%)] border-l border-white/5 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-[hsla(220,15%,95%,0.06)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-orange-400" />
                  <h2 className="text-sm font-black text-white">Your Shared Table Cart</h2>
                </div>
                <button
                  onClick={handleToggle}
                  className="p-1 rounded-lg hover:bg-white/5 text-[hsl(220,10%,55%)] hover:text-white transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center select-none">
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
              <div className="p-4 border-t border-[hsla(220,15%,95%,0.06)] bg-[hsl(30,12%,10%)]">
                <Button
                  className="w-full h-12 rounded-xl text-sm font-extrabold gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
                  disabled={items.length === 0}
                  onClick={() => {
                    setIsCheckoutOpen(true);
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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsOpen(false); // Close cart drawer too when closing checkout modal
        }}
      />
    </>
  );
}
