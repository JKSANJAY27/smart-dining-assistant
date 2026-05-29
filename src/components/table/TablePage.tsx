"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { StickyCategoryNav } from "@/components/menu/StickyCategoryNav";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { EmbeddedConcierge } from "@/components/ai/EmbeddedConcierge";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GreeterModal } from "@/components/landing/GreeterModal";
import { HeroSection } from "@/components/layout/HeroSection";
import { GroupDiningBanner } from "@/components/layout/GroupDiningBanner";
import { useAIChat } from "@/hooks/useAIChat";
import { useCartStore } from "@/store/cartStore";
import { useGroupSync } from "@/hooks/useGroupSync";
import { Avatar } from "@/components/ui/Avatar";
import { useMenuStore } from "@/store/menuStore";

interface TablePageProps {
  tableId: string;
}

export function TablePage({ tableId }: TablePageProps) {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState("");

  const { messages, isLoading, isStreaming, sendMessage, cancelStream } = useAIChat();
  const { displayName } = useCartStore();
  const { activeUsers, isConnected } = useGroupSync();
  const { setSearchQuery } = useMenuStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, [messages, mounted]);

  // Memoize latest recommended items from Zara's chat history to dynamically morph the menu grid carousel
  const aiRecommendedItems = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "ASSISTANT" && msg.metadata?.recommendedItems && msg.metadata.recommendedItems.length > 0) {
        return msg.metadata.recommendedItems;
      }
    }
    return [];
  }, [messages]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    setSearchQuery(val);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading || isStreaming) return;
    const text = inputText;
    setInputText("");
    setSearchQuery("");
    await sendMessage(text);
  };

  const handleQuickTap = async (query: string) => {
    setInputText("");
    setSearchQuery("");
    await sendMessage(query);
  };

  // Deduplicate active users
  const uniqueUsers = [...new Set(activeUsers)];
  const visibleUsers = uniqueUsers.slice(0, 3);
  const extraCount = Math.max(0, uniqueUsers.length - 3);

  if (!mounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 rounded-full border-2 border-[#EBE3D5] border-t-[#D97706] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAF7F2] flex flex-col hero-bg select-none">
      
      {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-[#F0EBE3] flex items-center px-6 md:px-8 gap-4 shrink-0"
        style={{ boxShadow: "0 1px 0 #F0EBE3" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#D97706] flex items-center justify-center shadow-sm shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-extrabold text-gray-950 leading-none font-plus-jakarta tracking-tight">
              {process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Spice Garden"}
            </p>
            <p className="text-[10px] text-[#D97706] font-bold leading-none mt-1">Premium AI-First Dining</p>
          </div>
        </div>

        {/* Co-diner avatars */}
        {visibleUsers.length > 0 && (
          <div className="flex items-center shrink-0" style={{ gap: "-4px" }}>
            <div className="flex -space-x-2">
              {visibleUsers.map((user, i) => (
                <div key={`nav-u-${i}`} className="ring-2 ring-white rounded-full">
                  <Avatar size="xs" fallback={user} />
                </div>
              ))}
            </div>
            {extraCount > 0 && (
              <div className="w-6 h-6 rounded-full bg-[#F5EFE6] ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-gray-600 ml-0.5">
                +{extraCount}
              </div>
            )}
          </div>
        )}

        {/* Sync indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`} />
          <span className="hidden md:inline text-[11px] font-bold text-gray-500">
            {isConnected ? "Live Synced" : "Connecting"}
          </span>
        </div>

        {/* Table badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[11px] font-black text-gray-700 shrink-0">
          Table {tableId}
        </div>
      </motion.header>

      {/* ══ CINEMATIC SINGLE FEED CONTENT ═══════════════════════════ */}
      <div className="w-full flex justify-center flex-1">
        <main className="max-w-6xl w-full px-6 py-12 md:px-10 pb-32 flex flex-col space-y-12 md:space-y-16">
          
          {/* Cinematic Hero */}
          <HeroSection 
            displayName={displayName} 
            tableId={tableId} 
            onQuickTap={handleQuickTap} 
          />

          {/* Group Dining Table state */}
          <GroupDiningBanner 
            activeUsers={activeUsers} 
            displayName={displayName} 
          />

          {/* Embedded Zara AI Concierge (includes prompt bar + responses) */}
          <EmbeddedConcierge
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            inputText={inputText}
            onInputChange={handleInputChange}
            onSend={handleSend}
            onCancelStream={cancelStream}
            onQuickTap={handleQuickTap}
            displayName={displayName}
            tableId={tableId}
          />

          {/* Sticky horizontal Category Navigation */}
          <StickyCategoryNav />

          {/* Menu Grid (horizontal AI picks + full menu) */}
          <MenuGrid tableId={tableId} recommendedItems={aiRecommendedItems} />

        </main>
      </div>

      {/* ══ CART DRAWER ═════════════════════════════════════════════ */}
      <CartDrawer />

      {/* ══ GREETER ONBOARDING ══════════════════════════════════════ */}
      <GreeterModal tableId={tableId} />

    </div>
  );
}
