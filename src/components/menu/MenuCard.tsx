"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus, Star, Flame, Clock, Sparkles } from "lucide-react";
import type { MenuItem } from "@prisma/client";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/hooks/useCartActions";

interface MenuCardProps {
  item: MenuItem;
  index?: number;
  tagline?: string;
}

const TAG_STYLES: Record<string, string> = {
  veg: "bg-emerald-50 border-emerald-200 text-emerald-700",
  "non-veg": "bg-rose-50 border-rose-200 text-rose-700",
  spicy: "bg-orange-50 border-orange-200 text-orange-700",
  bestseller: "bg-amber-50 border-amber-200 text-amber-700",
  "chef-special": "bg-purple-50 border-purple-200 text-purple-700",
  light: "bg-sky-50 border-sky-200 text-sky-700",
  "quick-serve": "bg-stone-50 border-stone-200 text-stone-600",
};

const TAG_LABELS: Record<string, string> = {
  veg: "🌿 Veg",
  "non-veg": "🍖 Non-Veg",
  spicy: "🌶 Spicy",
  bestseller: "⭐ Best Seller",
  "chef-special": "👨‍🍳 Chef's Pick",
  light: "✨ Light",
  "quick-serve": "⚡ Quick",
};

export function MenuCard({ item, index = 0, tagline }: MenuCardProps) {
  const { getItemQuantity, addItem, updateQuantity } = useCartActions();
  const quantity = getItemQuantity(item.id);
  const isInCart = quantity > 0;

  const displayTags = item.tags.filter((t) => TAG_LABELS[t]).slice(0, 2);

  const handleAdd = () => addItem(item);
  const handleIncrement = () => updateQuantity(item.id, quantity + 1);
  const handleDecrement = () => updateQuantity(item.id, Math.max(0, quantity - 1));

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      layout
      className={cn(
        "group relative rounded-[20px] bg-white",
        "border border-[#EBE3D5]/80",
        "shadow-sm hover:shadow-lg hover:-translate-y-1.5",
        "transition-all duration-300 overflow-hidden",
        "flex flex-col select-none",
        !item.available && "opacity-60 pointer-events-none"
      )}
    >
      {/* ── Food Image ─────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-stone-50 shrink-0 aspect-[16/10]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading={index < 6 ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6]">
            🍽️
          </div>
        )}

        {/* Sold out overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-xs font-black text-white bg-black/60 px-3.5 py-1.5 rounded-full uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}

        {/* Veg/Non-Veg dot — top-left */}
        <div className={cn(
          "absolute top-4 left-4 w-5.5 h-5.5 rounded-md bg-white shadow-xs border flex items-center justify-center",
          item.isVeg ? "border-green-300" : "border-red-300"
        )}>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            item.isVeg ? "bg-green-600" : "bg-red-500"
          )} />
        </div>

        {/* Popularity score — top-right */}
        {item.popularScore > 0.85 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-amber-100">
            <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" />
            <span className="text-[11px] font-black text-gray-800 leading-none">
              {(item.popularScore * 5).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ──────────────────────────── */}
      <div style={{ padding: "24px" }} className="flex flex-col flex-1 gap-3.5">
        <div className="space-y-1.5 text-left">
          {/* Name */}
          <h3 className="text-[17px] font-extrabold font-plus-jakarta text-gray-950 leading-snug line-clamp-1">
            {item.name}
          </h3>

          {/* AI Tagline (if available) */}
          {tagline && (
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-semibold leading-normal bg-amber-50/60 border border-amber-100/30 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-3 h-3 text-[#D97706] shrink-0" />
              <span className="line-clamp-1">{tagline}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 text-left">
          {item.description}
        </p>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "text-[11px] font-bold px-2.5 py-1 rounded-full border",
                  TAG_STYLES[tag] ?? "bg-stone-50 border-stone-200 text-stone-600"
                )}
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
          {item.calories && (
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              {item.calories} cal
            </span>
          )}
          {item.prepTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {item.prepTime} min
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE3]">
          <p className="text-[17px] font-black text-gray-900">
            {formatPrice(Number(item.price))}
          </p>

          {isInCart ? (
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl p-1 shrink-0 h-10">
              <button
                onClick={handleDecrement}
                id={`cart-minus-${item.id}`}
                aria-label={`Decrease quantity of ${item.name}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D97706] hover:bg-white transition-colors cursor-pointer no-min-size"
              >
                <Minus className="w-3.5 h-3.5 shrink-0" />
              </button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs font-black text-gray-950 min-w-[1.25rem] text-center"
              >
                {quantity}
              </motion.span>
              <button
                onClick={handleIncrement}
                id={`cart-plus-${item.id}`}
                aria-label={`Increase quantity of ${item.name}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D97706] hover:bg-white transition-colors cursor-pointer no-min-size"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          ) : (
            <button
              id={`add-to-cart-${item.id}`}
              onClick={handleAdd}
              disabled={!item.available}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-extrabold bg-[#D97706] hover:bg-[#B45309] text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 no-min-size"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Add
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
