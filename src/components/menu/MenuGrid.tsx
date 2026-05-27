"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, UtensilsCrossed } from "lucide-react";
import { MenuCard } from "./MenuCard";
import { CategoryTabs } from "./CategoryTabs";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { useMenuStore } from "@/store/menuStore";
import type { MenuItem } from "@prisma/client";

interface MenuGridProps {
  tableId: string;
}

interface MenuApiResponse {
  success: boolean;
  data: {
    items: MenuItem[];
    categories: string[];
    total: number;
  };
}

export function MenuGrid({ tableId: _tableId }: MenuGridProps) {
  const { items, filteredItems, setItems, isLoading, setLoading, setError, filter } = useMenuStore();

  // Fetch menu from API
  const { data, error } = useQuery<MenuApiResponse>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to fetch menu");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data?.success) {
      setItems(data.data.items, data.data.categories);
      setLoading(false);
    }
  }, [data, setItems, setLoading]);

  useEffect(() => {
    if (error) {
      setError("Failed to load menu. Please refresh.");
      setLoading(false);
    }
  }, [error, setError, setLoading]);

  // Popular items for the AI picks section
  const popularItems = useMemo(() => {
    return [...items]
      .sort((a, b) => b.popularScore - a.popularScore)
      .slice(0, 3);
  }, [items]);

  const isFiltering = filter.category || filter.tags.length > 0 || filter.allergens.length > 0 || filter.vegOnly || filter.searchQuery;

  // Loading skeleton
  if (items.length === 0 && !error) {
    return (
      <div className="space-y-4">
        <div className="h-11 skeleton rounded-xl" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 skeleton rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-[hsl(220,10%,60%)] text-sm">
          Couldn&apos;t load the menu. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <SearchBar />

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Filters */}
      <FilterBar />

      {/* AI Picks Section (hidden when filtering) */}
      <AnimatePresence>
        {!isFiltering && popularItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            aria-labelledby="ai-picks-heading"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center no-min-size">
                <Sparkles className="w-3.5 h-3.5 text-white no-min-size" />
              </div>
              <h2 id="ai-picks-heading" className="text-sm font-bold text-white">
                AI Pick for You
              </h2>
              <div className="flex items-center gap-1 ml-auto text-[10px] text-[hsl(220,10%,50%)]">
                <TrendingUp className="w-3 h-3 no-min-size" />
                Trending now
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3.5">
              {popularItems.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Divider */}
      {!isFiltering && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[hsla(220,15%,95%,0.08)]" />
          <p className="text-[11px] text-[hsl(220,8%,40%)] flex items-center gap-1.5">
            <UtensilsCrossed className="w-3 h-3 no-min-size" />
            Full Menu
          </p>
          <div className="h-px flex-1 bg-[hsla(220,15%,95%,0.08)]" />
        </div>
      )}

      {/* Menu Grid */}
      <section aria-label="Menu items">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-white mb-1">No items found</p>
            <p className="text-sm text-[hsl(220,10%,55%)]">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3.5"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Bottom padding for cart drawer */}
      <div className="h-32" aria-hidden="true" />
    </div>
  );
}
