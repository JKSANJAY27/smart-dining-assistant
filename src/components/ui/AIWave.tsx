"use client";

import { motion } from "framer-motion";

interface AIWaveProps {
  state?: "idle" | "thinking" | "streaming";
}

export function AIWave({ state = "idle" }: AIWaveProps) {
  // Variations in wave heights and speeds based on active state
  const isThinking = state === "thinking";
  const isStreaming = state === "streaming";

  return (
    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden bg-[hsl(220,18%,11%)] rounded-xl border border-[hsla(220,15%,95%,0.05)] shadow-inner">
      {/* Soft background ambient glow */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.15, 1] : isStreaming ? [1, 1.25, 1] : [1, 1.05, 1],
          opacity: isThinking ? 0.25 : isStreaming ? 0.35 : 0.15,
        }}
        transition={{
          duration: isThinking ? 1.5 : isStreaming ? 1.2 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 blur-xl pointer-events-none"
      />

      {/* Pulsing Waveform Lines */}
      <div className="flex items-center gap-1 z-10">
        {[...Array(9)].map((_, i) => {
          // Dynamic calculation of heights and delays
          const baseHeight = 6;
          const minHeight = isStreaming ? 24 : isThinking ? 16 : 8;
          const maxHeight = isStreaming ? 48 : isThinking ? 24 : 12;
          
          // Distribute heights so they form a beautiful bell curve at the center
          const multiplier = 1 - Math.abs(i - 4) * 0.18;
          
          return (
            <motion.span
              key={`wave-bar-${i}`}
              animate={{
                height: [
                  `${baseHeight + (minHeight - baseHeight) * multiplier}px`,
                  `${baseHeight + (maxHeight - baseHeight) * multiplier}px`,
                  `${baseHeight + (minHeight - baseHeight) * multiplier}px`,
                ],
              }}
              transition={{
                duration: isStreaming ? 0.6 + i * 0.05 : isThinking ? 1 + i * 0.1 : 2 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`w-1 rounded-full bg-gradient-to-t no-min-size ${
                isStreaming
                  ? "from-orange-500 via-rose-500 to-amber-400"
                  : isThinking
                  ? "from-rose-500 to-orange-400"
                  : "from-[hsl(220,10%,45%)] to-[hsl(220,10%,60%)]"
              }`}
            />
          );
        })}
      </div>

      {/* Captions inside the waveform */}
      <div className="absolute bottom-1 right-2.5 text-[8px] font-bold tracking-wider text-[hsl(220,10%,50%)] uppercase select-none">
        {isStreaming ? (
          <span className="text-orange-400 animate-pulse">Zara is speaking...</span>
        ) : isThinking ? (
          <span className="text-rose-400 animate-pulse">Thinking...</span>
        ) : (
          <span>Zara Sommelier</span>
        )}
      </div>
    </div>
  );
}
