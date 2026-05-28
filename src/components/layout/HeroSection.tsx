"use client";

import { motion } from "framer-motion";
import { Sparkles, UtensilsCrossed, TrendingUp } from "lucide-react";
import { getTimeOfDay } from "@/lib/utils";

interface HeroSectionProps {
  displayName: string;
  tableId: string;
  onQuickTap: (query: string) => void;
}

const greetings = {
  breakfast: "Good morning, culinary explorer ☀️",
  lunch: "Happy lunch hour 🍱",
  evening: "Unwind this beautiful evening 🌅",
  dinner: "A perfect evening for dining 🌙",
  late: "Late night cravings, curated 🌃",
};

export function HeroSection({ displayName, tableId, onQuickTap }: HeroSectionProps) {
  const timeOfDay = getTimeOfDay();
  const greeting = greetings[timeOfDay];

  // Quick suggestions for the dining assistant
  const recommendations = [
    { text: "Spicy starters", query: "What spicy starters do you recommend?" },
    { text: "Chef's signature", query: "What is the chef's special today?" },
    { text: "Fastest served", query: "What can be prepared in under 15 minutes?" },
  ];

  return (
    <section className="relative overflow-hidden w-full rounded-[32px] bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] border border-[#EBE3D5]/60 shadow-lg px-8 py-10 md:py-12 md:px-12 mb-8">
      {/* Dynamic Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-[#C2410C]/10 to-amber-300/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left Content */}
        <div className="flex-1 space-y-6 text-left max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EBE3D5] shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Session Active • Table {tableId}
            </span>
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold text-gray-950 font-plus-jakarta tracking-tight leading-tight"
            >
              {greeting.replace("culinary explorer", displayName || "culinary explorer")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-base text-gray-600 leading-relaxed font-medium"
            >
              Hi {displayName}, Zara here! I&apos;ve curated our premium menu just for you tonight. Craving a spicy adventure or something fresh and light?
            </motion.p>
          </div>

          {/* Quick Recommendations Pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3 pt-2"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#D97706]" />
              Zara suggests asking for:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {recommendations.map((rec, i) => (
                <motion.button
                  key={rec.text}
                  onClick={() => onQuickTap(rec.query)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#EBE3D5] text-gray-700 hover:border-[#D97706] hover:text-[#B45309] transition-all shadow-2xs cursor-pointer no-min-size"
                >
                  {rec.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Content — Pulsing Orb & Floating Recommendations */}
        <div className="relative w-full md:w-auto flex items-center justify-center min-h-[220px]">
          {/* Glowing Aura Rings */}
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#D97706]/20 to-orange-500/20 blur-xl animate-pulse" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400 via-[#D97706] to-orange-600 shadow-xl flex flex-col items-center justify-center text-white"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.08, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <Sparkles className="w-10 h-10 drop-shadow-md animate-pulse" />
              <span className="font-extrabold text-sm tracking-wider uppercase font-plus-jakarta drop-shadow-sm">ZARA AI</span>
              <span className="text-[10px] font-bold text-amber-100 opacity-90">Dining Concierge</span>
            </motion.div>

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-25 scale-125" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-ping opacity-15 scale-150" style={{ animationDuration: "4s" }} />
          </motion.div>

          {/* Floating Previews */}
          <motion.div
            initial={{ x: 30, y: -30, opacity: 0 }}
            animate={{ x: 60, y: -45, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#EBE3D5] shadow-md z-20 cursor-pointer"
            onClick={() => onQuickTap("Show me the spiciest biryani")}
          >
            <span className="text-xl">🌶️</span>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-gray-900 leading-none">Zara&apos;s Spice Pick</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Zara Biryani</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -30, y: 30, opacity: 0 }}
            animate={{ x: -60, y: 45, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="absolute hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#EBE3D5] shadow-md z-20 cursor-pointer"
            onClick={() => onQuickTap("Show me best dessert")}
          >
            <span className="text-xl">🍨</span>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-gray-900 leading-none">Trending Sweet</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Shahi Tukda</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
