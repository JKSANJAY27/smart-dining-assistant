"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Plus, Minus } from "lucide-react";
import Image from "next/image";
import type { MenuItem } from "@prisma/client";
import { useCartActions } from "@/hooks/useCartActions";
import { formatPrice } from "@/lib/utils";

interface AIPicksCarouselProps {
  items: MenuItem[];
  taglines: Record<string, string>;
  title?: string;
  subtitle?: string;
}

export function AIPicksCarousel({ items, taglines, title, subtitle }: AIPicksCarouselProps) {
  const { getItemQuantity, addItem, updateQuantity } = useCartActions();

  if (!items || items.length === 0) return null;

  return (
    <section className="w-full space-y-6 select-none mb-10" aria-labelledby="ai-picks-carousel-heading">
      
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#D97706]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 id="ai-picks-carousel-heading" className="text-xl font-bold font-plus-jakarta text-gray-950 tracking-tight leading-tight">
              {title || "Zara's Signature Recommendations"}
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              {subtitle || "Custom picked based on table dining trends"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[11px] font-bold text-gray-500">
          <TrendingUp className="w-3.5 h-3.5 text-[#D97706]" />
          <span>{title ? "AI Curated" : "Highly Popular Today"}</span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div 
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, index) => {
          const qty = getItemQuantity(item.id);
          const isInCart = qty > 0;
          const tagline = taglines[item.id] || "Chef's special selection for tonight.";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="snap-start shrink-0 w-[290px] md:w-[320px] rounded-3xl bg-white border border-[#EBE3D5] hover:border-[#D97706]/30 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image Area with 16:10 aspect ratio */}
              <div className="relative w-full aspect-[16/10] bg-stone-50 overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <Image
                     src={item.imageUrl}
                     alt={item.name}
                     fill
                     sizes="(max-width: 640px) 290px, 320px"
                     className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6]">
                    🍛
                  </div>
                )}

                {/* Spicy Tag */}
                {item.isSpicy && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-extrabold text-orange-600 border border-orange-100 flex items-center gap-1 shadow-2xs">
                    <span>🌶️</span>
                    <span>SPICY</span>
                  </div>
                )}

                {/* Rating Badge */}
                {item.popularScore > 0.8 && (
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-black text-gray-800 border border-amber-100 flex items-center gap-1 shadow-2xs">
                    <span className="text-amber-500 font-extrabold">★</span>
                    <span>{(item.popularScore * 5).toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Body with guaranteed 24px padding */}
              <div style={{ padding: "24px" }} className="flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2 text-left">
                    <h3 className="text-base font-extrabold font-plus-jakarta text-gray-950 leading-tight tracking-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-sm font-black text-gray-950 shrink-0">
                      {formatPrice(Number(item.price))}
                    </span>
                  </div>

                  {/* AI Concierge Tagline with special styling */}
                  <div className="rounded-xl bg-amber-50/70 border border-amber-100/40 p-2.5 flex items-start gap-2 text-left">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-amber-800 leading-snug">
                      {tagline}
                    </p>
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#F5EFE6]">
                  {isInCart ? (
                    <div className="flex-1 flex items-center justify-between bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl p-1 h-10">
                      <button
                        onClick={() => updateQuantity(item.id, qty - 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D97706] hover:bg-white transition-colors no-min-size"
                      >
                        <Minus className="w-3.5 h-3.5 shrink-0" />
                      </button>
                      <span className="text-xs font-black text-gray-900">{qty} in cart</span>
                      <button
                        onClick={() => updateQuantity(item.id, qty + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D97706] hover:bg-white transition-colors no-min-size"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(item)}
                      className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-extrabold bg-[#D97706] hover:bg-[#B45309] text-white transition-colors shadow-2xs cursor-pointer no-min-size"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Table Order</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
