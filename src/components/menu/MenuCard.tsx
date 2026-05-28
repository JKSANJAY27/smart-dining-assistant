"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus, Star, Flame, Clock, Leaf } from "lucide-react";
import type { MenuItem } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/hooks/useCartActions";

interface MenuCardProps {
  item: MenuItem;
  index?: number;
}

const TAG_BADGE_MAP: Record<string, { variant: "brand" | "accent" | "gold" | "rose" | "veg" | "non-veg" | "spicy" | "bestseller" | "chef-special" | "default"; label: string }> = {
  veg: { variant: "veg", label: "🌿 Veg" },
  "non-veg": { variant: "non-veg", label: "🍖 Non-Veg" },
  spicy: { variant: "spicy", label: "🌶 Spicy" },
  bestseller: { variant: "bestseller", label: "⭐ Bestseller" },
  "chef-special": { variant: "chef-special", label: "👨‍🍳 Chef's Pick" },
  light: { variant: "accent", label: "✨ Light" },
  "quick-serve": { variant: "default", label: "⚡ Quick" },
};

export function MenuCard({ item, index = 0 }: MenuCardProps) {
  const { getItemQuantity, addItem, updateQuantity } = useCartActions();
  const quantity = getItemQuantity(item.id);
  const isInCart = quantity > 0;

  const displayTags = item.tags
    .filter((tag) => TAG_BADGE_MAP[tag])
    .slice(0, 3);

  const handleAdd = () => {
    addItem(item);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      updateQuantity(item.id, 0); // removes from cart
    } else {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        "bg-[hsl(220,18%,11%)] border border-[hsla(220,15%,95%,0.08)]",
        "transition-all duration-250",
        "hover:border-[hsla(220,15%,95%,0.16)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30",
        !item.available && "opacity-60 pointer-events-none"
      )}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[hsl(220,16%,13%)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading={index < 6 ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full">
              Currently Unavailable
            </span>
          </div>
        )}

        {/* Veg/Non-veg dot indicator */}
        <div className={cn(
          "absolute top-2 left-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center no-min-size",
          item.isVeg
            ? "border-green-500 bg-white"
            : "border-red-500 bg-white"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full no-min-size",
            item.isVeg ? "bg-green-500" : "bg-red-500"
          )} />
        </div>

        {/* Popular score badge */}
        {item.popularScore > 0.88 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-[hsla(0,0%,0%,0.7)] backdrop-blur-sm px-1.5 py-0.5 rounded-full no-min-size">
            <Star className="w-2.5 h-2.5 text-yellow-400 no-min-size" fill="currentColor" />
            <span className="text-[10px] font-bold text-white">
              {Math.round(item.popularScore * 10) / 10}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Name */}
        <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-[hsl(220,10%,55%)] leading-relaxed mb-2 line-clamp-2">
          {item.description}
        </p>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {displayTags.map((tag) => {
              const config = TAG_BADGE_MAP[tag];
              if (!config) return null;
              return (
                <Badge key={tag} variant={config.variant} className="text-[10px] px-1.5 py-0 no-min-size">
                  {config.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Meta info row */}
        <div className="flex items-center gap-2 text-[10px] text-[hsl(220,10%,45%)] mb-3">
          {item.calories && (
            <span className="flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 no-min-size" aria-hidden="true" />
              {item.calories} cal
            </span>
          )}
          {item.prepTime && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 no-min-size" aria-hidden="true" />
              {item.prepTime}m
            </span>
          )}
          {item.isVeg && (
            <span className="flex items-center gap-0.5 text-green-500">
              <Leaf className="w-2.5 h-2.5 no-min-size" aria-hidden="true" />
              Pure Veg
            </span>
          )}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-white">{formatPrice(Number(item.price))}</p>
          </div>

          {isInCart ? (
            <div className="flex items-center gap-2 bg-[hsl(220,16%,17%)] rounded-xl px-1">
              <button
                onClick={handleDecrement}
                id={`cart-minus-${item.id}`}
                aria-label={`Decrease quantity of ${item.name}`}
                className="w-8 h-8 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-colors no-min-size"
              >
                <Minus className="w-3.5 h-3.5 no-min-size" aria-hidden="true" />
              </button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold text-white min-w-[1.25rem] text-center"
              >
                {quantity}
              </motion.span>
              <button
                onClick={handleIncrement}
                id={`cart-plus-${item.id}`}
                aria-label={`Increase quantity of ${item.name}`}
                className="w-8 h-8 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-colors no-min-size"
              >
                <Plus className="w-3.5 h-3.5 no-min-size" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              id={`add-to-cart-${item.id}`}
              onClick={handleAdd}
              disabled={!item.available}
              className="h-9 px-4 text-sm"
            >
              <Plus className="w-3.5 h-3.5 no-min-size" aria-hidden="true" />
              Add
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
