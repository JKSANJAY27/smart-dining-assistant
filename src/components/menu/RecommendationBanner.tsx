"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface RecommendationBannerProps {
  message: string;
  ctaText?: string;
  onClickCta?: () => void;
}

export function RecommendationBanner({ 
  message, 
  ctaText = "Explore pairing", 
  onClickCta 
}: RecommendationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative overflow-hidden w-full rounded-2xl bg-amber-50/40 border border-amber-100/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left my-8 select-none"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-[#D97706] shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs font-semibold text-amber-900 leading-normal max-w-xl">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {onClickCta && (
            <button
              onClick={onClickCta}
              className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:text-[#B45309] transition-colors cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-amber-100/50 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss pairing tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
