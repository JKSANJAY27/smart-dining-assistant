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

  const allCategories = [{ id: null, label: "All", icon: "🍽️" }, ...categories.map((c) => ({
    id: c,
    label: c,
    icon: CATEGORY_ICONS[c] ?? "🍴",
  }))];

  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: "none", paddingBottom: "4px" }}
    >
      {allCategories.map((cat) => {
        const isActive = cat.id === null
          ? !filter.category
          : filter.category === cat.id;

        return (
          <motion.button
            key={cat.label}
            role="tab"
            aria-selected={isActive}
            id={`cat-${cat.label.replace(/\s+/g, "-").replace(/[()]/g, "").toLowerCase()}`}
            onClick={() => setCategory(cat.id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full shrink-0 text-sm font-medium",
              "transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
              isActive
                ? "bg-[#D97706] text-white shadow-sm"
                : "bg-white text-gray-600 border border-[#EBE3D5] hover:border-[#D97706]/30 hover:text-gray-900"
            )}
          >
            <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: 1 }}>{cat.icon}</span>
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
