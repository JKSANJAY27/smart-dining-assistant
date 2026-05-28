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

  // Dynamic AI Upsell based on active cart items
  const hasBiryani = items.some(i => i.menuItem.name.toLowerCase().includes("biryani"));
  const hasButterChicken = items.some(i => i.menuItem.name.toLowerCase().includes("chicken"));
  const hasStarters = items.some(i => i.menuItem.category.toLowerCase().includes("starter"));
  const hasDesserts = items.some(i => i.menuItem.category.toLowerCase().includes("dessert"));

  let upsellMessage = "";
  if (hasBiryani) {
    upsellMessage = "🍛 Add Cucumber Raita to perfectly complement your Biryani order!";
  } else if (hasButterChicken) {
    upsellMessage = "🫓 Garlic Naan goes beautifully with slow-cooked Butter Chicken. Add it?";
  } else if (hasStarters && !hasDesserts) {
    upsellMessage = "🍰 Complete your premium dining experience with our Chef's signature Shahi Tukda dessert.";
  } else {
    upsellMessage = "✨ Zara suggests adding a cold beverage to refresh your table.";
  }

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
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md px-3.5 py-3 rounded-2xl bg-white border border-[#F5EFE6] shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-[#D97706]/10 border border-[#D97706]/20 flex items-center justify-center text-[#D97706] no-min-size shadow-2xs">
                <ShoppingBag className="w-5 h-5 no-min-size" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D97706] text-[9px] font-black text-white flex items-center justify-center border-2 border-white no-min-size shadow-2xs">
                  {itemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">Your Cart</p>
                <p className="text-[10px] text-[#D97706] font-bold mt-1 leading-none">{formatPrice(total)}</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleToggle}
              className="gap-1.5 h-9 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-[#D97706] hover:opacity-95 text-white shadow-xs cursor-pointer"
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
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleToggle}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#FFFDF9] border-l border-[#F5EFE6] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#F5EFE6] bg-[#FAF7F2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-[#D97706]" />
                  <h2 className="text-sm font-extrabold text-gray-950 font-plus-jakarta">Your Shared Table Cart</h2>
                </div>
                <button
                  onClick={handleToggle}
                  className="p-1 rounded-lg hover:bg-[#F5EFE6] text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                    <p className="text-4xl mb-2" aria-hidden="true">🛒</p>
                    <p className="text-sm font-semibold text-gray-800">Your cart is empty</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Browse the menu to add delicious items!</p>
                  </div>
                ) : (
                  <>
                    {/* Active Cart Items */}
                    <div className="space-y-1">
                      {items.map((item) => (
                        <CartItem key={item.menuItem.id} item={item} />
                      ))}
                    </div>

                    {/* AI Upsell recommendation box */}
                    <div className="rounded-2xl bg-amber-50/60 border border-amber-100/30 p-3.5 flex items-start gap-2.5 text-left">
                      <Sparkles className="w-4.5 h-4.5 text-[#D97706] shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-amber-900 leading-normal">
                        {upsellMessage}
                      </p>
                    </div>
                  </>
                )}

                {/* Bill details */}
                <CartSummary />
              </div>

              {/* Checkout / Footer Panel */}
              <div className="p-4 border-t border-[#F5EFE6] bg-[#FAF7F2] shadow-sm">
                <Button
                  className="w-full h-14 rounded-2xl text-sm font-extrabold gap-2 bg-gradient-to-r from-[#D97706] to-[#C2410C] hover:opacity-95 text-white shadow-md cursor-pointer"
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
