"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Wifi, Users, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MenuGrid } from "@/components/menu/MenuGrid";
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

      {/* Sticky Header */}
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
            <h1 className="text-sm font-bold text-white leading-none">
              {process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Spice Garden"}
            </h1>
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
      <main className="relative z-10 px-4 pt-4 pb-32 max-w-lg mx-auto">
        {/* Greeting Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[hsla(24,95%,53%,0.1)] to-[hsla(340,82%,57%,0.05)] border border-[hsla(24,95%,53%,0.15)] mb-4"
        >
          <div className="flex items-center gap-2.5">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              className="text-2xl no-min-size"
              aria-hidden="true"
            >
              {greeting.emoji}
            </motion.span>
            <div>
              <p className="text-sm font-bold text-white">{greeting.text}</p>
              <p className="text-[11px] text-[hsl(220,10%,55%)]">
                Welcome to{" "}
                <span className="text-orange-400">
                  {process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Spice Garden"}
                </span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center mb-0.5">
                <Users className="w-3 h-3 text-emerald-400 no-min-size" />
              </div>
              <p className="text-[10px] text-[hsl(220,10%,50%)]">Table</p>
              <p className="text-xs font-bold text-white">{tableId}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-0.5">
                <Clock className="w-3 h-3 text-yellow-400 no-min-size" />
              </div>
              <p className="text-[10px] text-[hsl(220,10%,50%)]">Wait</p>
              <p className="text-xs font-bold text-white">~15m</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-0.5">
                <Star className="w-3 h-3 text-orange-400 no-min-size" fill="currentColor" />
              </div>
              <p className="text-[10px] text-[hsl(220,10%,50%)]">Rating</p>
              <p className="text-xs font-bold text-white">4.8</p>
            </div>
          </div>
        </motion.div>

        {/* Wi-Fi Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[hsla(217,91%,60%,0.07)] border border-[hsla(217,91%,60%,0.15)] mb-5"
        >
          <Wifi className="w-4 h-4 text-blue-400 shrink-0 no-min-size" aria-hidden="true" />
          <p className="text-xs text-[hsl(220,10%,55%)]">
            Free Wi-Fi:{" "}
            <span className="text-white font-medium">SpiceGarden_Guest</span>
            {" "}· No password
          </p>
        </motion.div>

        {/* Menu Grid */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <MenuGrid tableId={tableId} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
