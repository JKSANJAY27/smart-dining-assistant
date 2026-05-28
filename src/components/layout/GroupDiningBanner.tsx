"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface GroupDiningBannerProps {
  activeUsers: string[];
  displayName: string;
}

export function GroupDiningBanner({ activeUsers, displayName }: GroupDiningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Deduplicate active users and remove current user from counting for secondary mentions
  const uniqueUsers = [...new Set(activeUsers)];
  const coDiners = uniqueUsers.filter(u => u !== displayName);
  
  if (isDismissed || uniqueUsers.length <= 1) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative overflow-hidden w-full rounded-2xl bg-amber-50/50 border border-amber-100/60 p-4 md:p-5 mb-8 flex items-center justify-between gap-4"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-amber-100/20 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 flex-1">
          {/* Icons/Pulse */}
          <div className="relative shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Users className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div className="text-left space-y-1">
            <p className="text-sm font-extrabold text-gray-950 font-plus-jakarta leading-none flex items-center gap-1.5">
              <span>Group Dining Table Active</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-[10px] font-black text-amber-800 uppercase tracking-wider">
                Live Sync
              </span>
            </p>
            <p className="text-xs font-semibold text-gray-500 leading-normal">
              {coDiners.length > 0 ? (
                <>
                  You and <strong className="text-gray-800">{coDiners.join(", ")}</strong> are ordering together. Add items to see them sync live!
                </>
              ) : (
                <>Multiple devices are connected to your table cart. Share the taste!</>
              )}
            </p>
          </div>
        </div>

        {/* Avatars Stack */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex -space-x-3.5 overflow-hidden">
            {uniqueUsers.map((user, i) => (
              <div 
                key={`banner-avatar-${user}-${i}`} 
                className="inline-block rounded-full ring-4 ring-white shadow-sm"
              >
                <Avatar size="sm" fallback={user} />
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-amber-100/60 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
