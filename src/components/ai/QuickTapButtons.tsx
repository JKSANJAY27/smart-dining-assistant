"use client";

import { motion } from "framer-motion";

interface QuickTapButtonsProps {
  onTap: (text: string) => void;
  disabled?: boolean;
}

const quickIntents = [
  { label: "🌶️ Spicy Starters", query: "Can you recommend some spicy starters?" },
  { label: "🥬 Pure Veg Mains", query: "What are your best vegetarian main courses?" },
  { label: "🍧 Chef Specials", query: "Show me the chef's special signature dishes." },
  { label: "🍹 Cool Mocktails", query: "Recommend some refreshing cold beverages." },
  { label: "🌾 Gluten-Free", query: "Do you have any gluten-free dishes?" },
  { label: "🍨 Sweet Desserts", query: "What cold desserts do you suggest?" },
  { label: "🥘 Light Dinner", query: "Recommend a light, mild dinner combination." },
  { label: "🛎️ Call Waiter", query: "I would like to call a human waiter to our table, please." },
];

export function QuickTapButtons({ onTap, disabled }: QuickTapButtonsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 flex gap-2.5">
      {quickIntents.map((intent, idx) => (
        <motion.button
          key={`quick-${idx}`}
          whileTap={{ scale: 0.95 }}
          onClick={() => !disabled && onTap(intent.query)}
          disabled={disabled}
          className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold text-white bg-[hsl(30,12%,10%)] hover:bg-[hsl(30,10%,14%)] border border-[hsla(30,10%,95%,0.06)] hover:border-orange-500/50 transition-all cursor-pointer no-min-size shadow-sm select-none"
        >
          {intent.label}
        </motion.button>
      ))}
    </div>
  );
}
