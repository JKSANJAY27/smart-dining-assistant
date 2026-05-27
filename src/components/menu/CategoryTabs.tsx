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

export function CategoryTabs() {
  const { categories, filter, setCategory } = useMenuStore();

  const allCategories = ["All", ...categories];

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label="Menu categories"
        className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {allCategories.map((cat) => {
          const isActive = cat === "All" ? !filter.category : filter.category === cat;
          const icon = cat === "All" ? "🍽️" : CATEGORY_ICONS[cat] || "🍴";

          return (
            <motion.button
              key={cat}
              role="tab"
              aria-selected={isActive}
              id={`cat-tab-${cat.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => setCategory(cat === "All" ? null : cat)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full shrink-0 text-sm font-medium",
                "transition-all duration-200 no-min-size",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_0_12px_hsla(24,95%,53%,0.35)]"
                  : "bg-[hsl(220,16%,15%)] text-[hsl(220,10%,60%)] border border-[hsla(220,15%,95%,0.1)] hover:border-[hsla(220,15%,95%,0.2)] hover:text-white"
              )}
            >
              <span className="no-min-size text-base" aria-hidden="true">
                {icon}
              </span>
              <span>{cat}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
