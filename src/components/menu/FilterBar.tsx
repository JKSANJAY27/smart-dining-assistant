"use client";

import { SlidersHorizontal, Leaf, Flame, Zap, Crown, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";

const QUICK_TAGS = [
  { label: "🌶 Spicy", tag: "spicy" },
  { label: "🥗 Light", tag: "light" },
  { label: "🍽 Filling", tag: "filling" },
  { label: "⭐ Bestseller", tag: "bestseller" },
  { label: "👨‍🍳 Chef Special", tag: "chef-special" },
  { label: "⚡ Quick Serve", tag: "quick-serve" },
];

const ALLERGENS = ["dairy", "gluten", "nuts", "eggs", "soy", "shellfish", "fish"];

export function FilterBar() {
  const [showAllergens, setShowAllergens] = useState(false);
  const { filter, toggleTag, toggleAllergenExclusion, setVegOnly, resetFilters } = useMenuStore();

  const hasActiveFilters =
    filter.tags.length > 0 ||
    filter.allergens.length > 0 ||
    filter.vegOnly;

  return (
    <div className="space-y-3">
      {/* Quick Tags Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {/* Veg Only Toggle */}
        <button
          id="filter-veg-only"
          onClick={() => setVegOnly(!filter.vegOnly)}
          aria-pressed={filter.vegOnly}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 text-xs font-semibold",
            "transition-all duration-200 no-min-size border",
            filter.vegOnly
              ? "bg-[hsla(142,71%,45%,0.2)] text-green-400 border-[hsla(142,71%,45%,0.4)]"
              : "bg-[hsl(220,16%,15%)] text-[hsl(220,10%,60%)] border-[hsla(220,15%,95%,0.1)] hover:border-[hsla(220,15%,95%,0.2)]"
          )}
        >
          <Leaf className="w-3 h-3 no-min-size" aria-hidden="true" />
          Veg Only
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[hsla(220,15%,95%,0.1)] shrink-0" />

        {/* Quick Tag Filters */}
        {QUICK_TAGS.map(({ label, tag }) => {
          const isActive = filter.tags.includes(tag);
          return (
            <button
              key={tag}
              id={`filter-tag-${tag}`}
              onClick={() => toggleTag(tag)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full shrink-0 text-xs font-semibold",
                "transition-all duration-200 no-min-size border",
                isActive
                  ? "bg-[hsla(24,95%,53%,0.2)] text-orange-400 border-[hsla(24,95%,53%,0.4)]"
                  : "bg-[hsl(220,16%,15%)] text-[hsl(220,10%,60%)] border-[hsla(220,15%,95%,0.1)] hover:border-[hsla(220,15%,95%,0.2)]"
              )}
            >
              {label}
            </button>
          );
        })}

        {/* Allergen Toggle */}
        <button
          id="filter-allergens-toggle"
          onClick={() => setShowAllergens(!showAllergens)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 text-xs font-semibold",
            "transition-all duration-200 no-min-size border",
            filter.allergens.length > 0
              ? "bg-[hsla(340,82%,57%,0.15)] text-rose-400 border-[hsla(340,82%,57%,0.3)]"
              : "bg-[hsl(220,16%,15%)] text-[hsl(220,10%,60%)] border-[hsla(220,15%,95%,0.1)] hover:border-[hsla(220,15%,95%,0.2)]"
          )}
        >
          <SlidersHorizontal className="w-3 h-3 no-min-size" aria-hidden="true" />
          Allergens
          {filter.allergens.length > 0 && (
            <span className="bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] no-min-size">
              {filter.allergens.length}
            </span>
          )}
          <ChevronDown
            className={cn("w-3 h-3 no-min-size transition-transform", showAllergens && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {/* Reset Filters */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={resetFilters}
              id="filter-reset"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full shrink-0 text-xs font-semibold no-min-size bg-[hsla(220,15%,95%,0.08)] text-[hsl(220,10%,60%)] border border-[hsla(220,15%,95%,0.1)] hover:text-white transition-colors"
            >
              <X className="w-3 h-3 no-min-size" aria-hidden="true" />
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Allergen Panel */}
      <AnimatePresence>
        {showAllergens && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-[hsl(220,16%,13%)] border border-[hsla(220,15%,95%,0.08)]">
              <p className="text-xs text-[hsl(220,10%,50%)] mb-2 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-rose-400 no-min-size" />
                Exclude items containing:
              </p>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => {
                  const isExcluded = filter.allergens.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      id={`allergen-${allergen}`}
                      onClick={() => toggleAllergenExclusion(allergen)}
                      aria-pressed={isExcluded}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium capitalize",
                        "transition-all duration-150 no-min-size border",
                        isExcluded
                          ? "bg-[hsla(0,72%,51%,0.2)] text-red-400 border-[hsla(0,72%,51%,0.35)]"
                          : "bg-[hsl(220,16%,17%)] text-[hsl(220,10%,55%)] border-[hsla(220,15%,95%,0.08)] hover:border-[hsla(220,15%,95%,0.2)]"
                      )}
                    >
                      {isExcluded && <X className="w-2.5 h-2.5 inline mr-1 no-min-size" />}
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
