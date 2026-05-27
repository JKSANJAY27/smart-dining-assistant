"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Wifi, Users, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getTimeOfDay } from "@/lib/utils";

interface TablePageProps {
  tableId: string;
}

const timeGreetings = {
  breakfast: { emoji: "☀️", text: "Good Morning!" },
  lunch: { emoji: "🍱", text: "Lunch Time!" },
  evening: { emoji: "🌅", text: "Good Evening!" },
  dinner: { emoji: "🌙", text: "Dinner Time!" },
  late: { emoji: "🌃", text: "Late Night Bites!" },
};

export function TablePage({ tableId }: TablePageProps) {
  const [mounted, setMounted] = useState(false);
  const timeOfDay = getTimeOfDay();
  const greeting = timeGreetings[timeOfDay];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[hsla(220,15%,95%,0.15)] border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Ambient background orbs */}
      <div
        aria-hidden="true"
        className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(24,95%,53%), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="fixed bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(162,73%,46%), transparent 70%)",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 glass-strong px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_16px_hsla(24,95%,53%,0.4)] no-min-size">
            <UtensilsCrossed className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Spice Garden</h1>
            <p className="text-[11px] text-[hsl(220,10%,55%)] mt-0.5">AI-Powered Dining</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="live">
            <span>Live</span>
          </Badge>
          <Badge variant="default" className="gap-1.5">
            <UtensilsCrossed className="w-3 h-3 no-min-size" aria-hidden="true" />
            <span>Table {tableId}</span>
          </Badge>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pt-6 pb-32 max-w-lg mx-auto">
        {/* Welcome Section */}
        <AnimatePresence>
          <motion.section
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-5xl mb-3 inline-block"
              aria-hidden="true"
            >
              {greeting.emoji}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {greeting.text}
            </h2>
            <p className="text-[hsl(220,10%,60%)] text-sm">
              Welcome to <span className="text-orange-400 font-semibold">Spice Garden</span>
            </p>
          </motion.section>
        </AnimatePresence>

        {/* Table Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-surface p-4 mb-6"
        >
          <div className="grid grid-cols-3 divide-x divide-[hsla(220,15%,95%,0.08)]">
            <div className="flex flex-col items-center gap-1.5 px-2">
              <div className="w-8 h-8 rounded-lg bg-[hsla(24,95%,53%,0.12)] flex items-center justify-center no-min-size">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" aria-hidden="true" />
              </div>
              <p className="text-xs text-[hsl(220,10%,55%)]">Table</p>
              <p className="text-sm font-bold text-white">{tableId}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-2">
              <div className="w-8 h-8 rounded-lg bg-[hsla(162,73%,46%,0.12)] flex items-center justify-center no-min-size">
                <Users className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              <p className="text-xs text-[hsl(220,10%,55%)]">Guests</p>
              <p className="text-sm font-bold text-white">1</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-2">
              <div className="w-8 h-8 rounded-lg bg-[hsla(45,96%,64%,0.12)] flex items-center justify-center no-min-size">
                <Clock className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              </div>
              <p className="text-xs text-[hsl(220,10%,55%)]">Wait</p>
              <p className="text-sm font-bold text-white">~15m</p>
            </div>
          </div>
        </motion.div>

        {/* Wi-Fi card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-[hsla(217,91%,60%,0.08)] border border-[hsla(217,91%,60%,0.15)] mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-[hsla(217,91%,60%,0.15)] flex items-center justify-center no-min-size shrink-0">
            <Wifi className="w-4 h-4 text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-400">Free Wi-Fi</p>
            <p className="text-xs text-[hsl(220,10%,55%)]">
              Network: <span className="text-white">SpiceGarden_Guest</span> • No password
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="card-surface p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsla(24,95%,53%,0.12)] flex items-center justify-center no-min-size shrink-0">
              <Star className="w-4 h-4 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[hsl(220,10%,55%)]">Rating</p>
              <p className="text-sm font-bold text-white">4.8 ★</p>
            </div>
          </div>
          <div className="card-surface p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsla(162,73%,46%,0.12)] flex items-center justify-center no-min-size shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[hsl(220,10%,55%)]">Menu Items</p>
              <p className="text-sm font-bold text-white">60+</p>
            </div>
          </div>
        </motion.div>

        {/* Loading State — full menu coming in Phase 3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card-surface p-6 text-center"
        >
          <div className="text-3xl mb-3" aria-hidden="true">🍽️</div>
          <h3 className="font-bold text-white mb-1.5">Menu Loading Soon</h3>
          <p className="text-sm text-[hsl(220,10%,55%)]">
            AI-powered menu with Zara is being set up. Phase 3 will bring the full experience!
          </p>
        </motion.div>
      </main>
    </div>
  );
}
