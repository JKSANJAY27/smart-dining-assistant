"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { MenuCard } from "./MenuCard";
import { FilterBar } from "./FilterBar";
import { AIPicksCarousel } from "./AIPicksCarousel";
import { RecommendationBanner } from "./RecommendationBanner";
import { useMenuStore } from "@/store/menuStore";
import { useCartStore } from "@/store/cartStore";
import { useCartActions } from "@/hooks/useCartActions";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@prisma/client";

interface MenuGridProps {
  tableId: string;
  recommendedItems?: MenuItem[];
}

interface MenuApiResponse {
  success: boolean;
  data: {
    items: MenuItem[];
    categories: string[];
    total: number;
  };
}

export function MenuGrid({ tableId: _tableId, recommendedItems }: MenuGridProps) {
  const { items, filteredItems, setItems, isLoading, setLoading, setError, filter } = useMenuStore();
  const [showFilters, setShowFilters] = useState(false);
  const { items: cartItems } = useCartStore();
  const { addItem } = useCartActions();

  // Fetch menu from API
  const { data, error } = useQuery<MenuApiResponse>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to fetch menu");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch AI taglines from API
  const { data: taglinesData } = useQuery<Record<string, string>>({
    queryKey: ["taglines"],
    queryFn: async () => {
      const res = await fetch("/api/menu/taglines");
      if (!res.ok) throw new Error("Failed to fetch taglines");
      const json = await res.json();
      return json.success ? json.data : {};
    },
    staleTime: 10 * 60 * 1000,
  });

  const taglines = taglinesData || {};

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

  // Popular items fallback
  const popularItems = useMemo(() => {
    return [...items].sort((a, b) => b.popularScore - a.popularScore).slice(0, 4);
  }, [items]);

  // Dynamic Sommelier Pairing logic based on cart items
  const dynamicPairing = useMemo(() => {
    const hasBiryani = cartItems.some(i => i.menuItem.name.toLowerCase().includes("biryani"));
    const hasButterChicken = cartItems.some(i => i.menuItem.name.toLowerCase().includes("chicken"));
    
    if (hasBiryani) {
      const raitaItem = items.find(item => item.name.toLowerCase().includes("raita"));
      const isAlreadyInCart = cartItems.some(i => i.menuItem.name.toLowerCase().includes("raita"));
      if (raitaItem && !isAlreadyInCart) {
        return {
          message: "🍛 Your Saffron Biryani pairs beautifully with our cool Cucumber Raita. Add it to balance the spices!",
          item: raitaItem,
          ctaText: "Add Cucumber Raita"
        };
      }
    }
    
    if (hasButterChicken) {
      const naanItem = items.find(item => item.name.toLowerCase().includes("naan"));
      const isAlreadyInCart = cartItems.some(i => i.menuItem.name.toLowerCase().includes("naan"));
      if (naanItem && !isAlreadyInCart) {
        return {
          message: "🫓 Garlic Naan is the perfect match for soaking up our rich Butter Chicken gravy. Add it fresh!",
          item: naanItem,
          ctaText: "Add Garlic Naan"
        };
      }
    }
    
    return null;
  }, [cartItems, items]);

  // Determine carousel items based on Zara's active recommendations vs static popular
  const hasLiveRecommendations = recommendedItems && recommendedItems.length > 0;
  const carouselItems = hasLiveRecommendations ? recommendedItems : popularItems;
  const carouselTitle = hasLiveRecommendations ? "Zara's Live Recommendations ✨" : "Zara's Signature Recommendations";
  const carouselSubtitle = hasLiveRecommendations 
    ? "Dishes selected dynamically based on your craving discussion" 
    : "Custom picked based on table dining trends";

  const isFiltering = filter.category || filter.tags.length > 0 || filter.allergens.length > 0 || filter.vegOnly || filter.searchQuery;
  const hasActiveFilters = filter.tags.length > 0 || filter.allergens.length > 0 || filter.vegOnly;

  // Loading skeleton
  if (items.length === 0 && !error) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton rounded-full max-w-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-white border border-[#EBE3D5]/40">
              <div className="aspect-[16/10] skeleton" />
              <div className="p-5 space-y-3">
                <div className="h-5 skeleton rounded-full w-3/4" />
                <div className="h-4 skeleton rounded-full" />
                <div className="h-4 skeleton rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-bold text-gray-800 mb-1">Couldn&apos;t load the menu</p>
        <p className="text-gray-500 text-sm">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 select-none">
      {/* AI Picks Section — shown only when not filtering */}
      <AnimatePresence mode="wait">
        {!isFiltering && carouselItems.length > 0 && (
          <motion.div
            key="ai-picks-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <AIPicksCarousel 
              items={carouselItems} 
              taglines={taglines} 
              title={carouselTitle}
              subtitle={carouselSubtitle}
            />

            {/* Dynamic Sommelier Pairing Recommendation Banner */}
            {dynamicPairing ? (
              <RecommendationBanner 
                message={dynamicPairing.message}
                ctaText={dynamicPairing.ctaText}
                onClickCta={() => addItem(dynamicPairing.item)}
              />
            ) : (
              <RecommendationBanner 
                message="🍷 Chef's Signature Tip: Pair our slow-cooked Saffron Biryani with a cool Cucumber Raita for the ultimate spice balance."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter toggle row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-full text-xs font-bold font-plus-jakarta border transition-all cursor-pointer shrink-0",
            hasActiveFilters || showFilters
              ? "bg-[#D97706] text-white border-[#D97706]"
              : "bg-white text-gray-600 border-[#EBE3D5] hover:border-[#D97706]/30"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">
              {filter.tags.length + filter.allergens.length + (filter.vegOnly ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform shrink-0", showFilters && "rotate-180")} />
        </button>

        {isFiltering && (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} match
          </p>
        )}
      </div>

      {/* Filter bar (collapsible) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FilterBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      {!isFiltering && (
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-[#EBE3D5]/60" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Explore Full Menu</span>
          <div className="h-px flex-1 bg-[#EBE3D5]/60" />
        </div>
      )}

      {/* Menu Grid */}
      <section aria-label="Menu items">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EBE3D5]">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-extrabold text-gray-800 mb-1">No items match your craving</p>
            <p className="text-xs font-semibold text-gray-500 max-w-xs mx-auto leading-relaxed">
              Try adjusting your search or clear the filters to browse the full menu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, i) => (
              <MenuCard 
                key={item.id} 
                item={item} 
                index={i} 
                tagline={taglines[item.id]} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom padding for cart drawer */}
      <div className="h-16" aria-hidden="true" />
    </div>
  );
}
