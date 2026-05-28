"use client";

import { useGroupSync } from "@/hooks/useGroupSync";
import { useCartStore } from "@/store/cartStore";
import { Avatar } from "@/components/ui/Avatar";
import { Wifi, WifiOff, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GroupBanner() {
  const { activeUsers, isConnected } = useGroupSync();
  const { displayName } = useCartStore();

  // Filter out empty names and duplicate displayName if any
  const otherUsers = activeUsers.filter(
    (user) => user && user.toLowerCase() !== displayName.toLowerCase()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-3 rounded-xl glass border border-[hsla(220,15%,95%,0.06)] flex items-center justify-between mb-4 shadow-md"
    >
      <div className="flex items-center gap-3">
        {/* Connection status indicator */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[hsl(220,16%,13%)] flex items-center justify-center border border-[hsla(220,15%,95%,0.08)]">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[hsl(220,20%,7%)] ${
              isConnected ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">
              {isConnected ? "Group Session Connected" : "Connecting Sync..."}
            </span>
            {isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <p className="text-[10px] text-[hsl(220,10%,55%)] mt-0.5">
            {activeUsers.length <= 1 ? (
              <span>Only you are ordering right now</span>
            ) : (
              <span>
                {activeUsers.length} diners ordering together
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Avatars of active diners */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2.5 overflow-hidden">
          {/* User's own avatar */}
          <motion.div
            layout
            key="me"
            className="ring-2 ring-[hsl(220,20%,7%)] rounded-full z-10"
          >
            <Avatar
              size="xs"
              fallback={displayName || "Guest"}
              className="border border-[hsla(220,15%,95%,0.15)] shadow-sm"
            />
          </motion.div>

          {/* Other diners' avatars */}
          <AnimatePresence mode="popLayout">
            {otherUsers.map((user, idx) => (
              <motion.div
                layout
                key={`user-${user}-${idx}`}
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="ring-2 ring-[hsl(220,20%,7%)] rounded-full"
                style={{ zIndex: 9 - idx }}
              >
                <Avatar
                  size="xs"
                  fallback={user}
                  className="border border-[hsla(220,15%,95%,0.15)] shadow-sm"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Small badge of other count if many */}
        {activeUsers.length > 1 && (
          <span className="text-[10px] text-[hsl(220,10%,60%)] bg-[hsla(220,15%,95%,0.06)] px-1.5 py-0.5 rounded-md font-medium border border-[hsla(220,15%,95%,0.05)]">
            +{activeUsers.length - 1} online
          </span>
        )}
      </div>
    </motion.div>
  );
}
