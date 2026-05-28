"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";

const CATEGORY_ICONS: Record<string, string> = {
  "Veg Starters": "🥗",
  "Non-Veg Starters": "🍗",
  "Mains (Veg)": "🍛",
  "Mains (Non-Veg)": "🥩",
  "Breads & Rice": "🫓",
  Desserts: "🍰",
  "Beverages (Hot)": "☕",
  "Beverages (Cold)": "🥤",
  "Combos & Deals": "🎁",
};

export function StickyCategoryNav() {
  const { categories, filter, setCategory } = useMenuStore();

  const allCategories = [
    { id: null, label: "All", icon: "🍽️" },
    ...categories.map((c) => ({
      id: c,
      label: c,
      icon: CATEGORY_ICONS[c] ?? "🍴",
    })),
  ];

  return (
    <div className="sticky top-16 z-30 w-full bg-white/70 backdrop-blur-md border-b border-[#F0EBE3] py-3.5 mb-8 select-none">
      <div
        role="tablist"
        aria-label="Menu categories"
        className="max-w-7xl mx-auto flex gap-3 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {allCategories.map((cat) => {
          const isActive = cat.id === null ? !filter.category : filter.category === cat.id;

          return (
            <motion.button
              key={cat.label}
              role="tab"
              aria-selected={isActive}
              id={`cat-${cat.label.replace(/\s+/g, "-").replace(/[()]/g, "").toLowerCase()}`}
              onClick={() => setCategory(cat.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 h-11 px-4.5 rounded-full shrink-0 text-xs font-bold font-plus-jakarta border transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-[#D97706] text-white border-amber-600 shadow-md"
                  : "bg-white text-gray-600 border-[#EBE3D5] hover:border-[#D97706]/40 hover:text-gray-950"
              )}
            >
              <span aria-hidden="true" className="text-sm leading-none shrink-0">{cat.icon}</span>
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
