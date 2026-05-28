"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Wifi, Users, Clock, Star, Sparkles, Send, MessageCircle, Menu, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GroupBanner } from "@/components/group/GroupBanner";
import { GreeterModal } from "@/components/landing/GreeterModal";
import { AIWave } from "@/components/ui/AIWave";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { QuickTapButtons } from "@/components/ai/QuickTapButtons";
import { TypingIndicator } from "@/components/ai/TypingIndicator";
import { useAIChat } from "@/hooks/useAIChat";
import { useCartStore } from "@/store/cartStore";
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
  const [activeTab, setActiveTab] = useState<"zara" | "menu">("zara");
  const [inputText, setInputText] = useState("");
  
  const { messages, isLoading, isStreaming, sendMessage, cancelStream } = useAIChat();
  const { displayName } = useCartStore();

  const timeOfDay = getTimeOfDay();
  const greeting = timeGreetings[timeOfDay];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setTimeout(scrollToBottom, 150);
    }
  }, [messages, mounted]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading || isStreaming) return;
    
    const text = inputText;
    setInputText("");
    await sendMessage(text);
  };

  const handleQuickTap = async (queryText: string) => {
    await sendMessage(queryText);
  };

  if (!mounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[hsl(30,16%,6%)]">
        <div className="w-8 h-8 rounded-full border-2 border-[hsla(30,15%,95%,0.15)] border-t-orange-500 animate-spin" />
      </div>
    );
  }

  // ─── AI Sommelier Chat Panel Component ─────────────────────────────────
  const renderChatPanel = () => (
    <div className="flex flex-col h-[65vh] md:h-[75vh] glass-premium rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Wave Header */}
      <div className="p-3 bg-gradient-to-b from-[hsl(30,12%,10%)] to-transparent shrink-0">
        <AIWave state={isStreaming ? "streaming" : isLoading ? "thinking" : "idle"} />
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none flex flex-col bg-black/10">
        <div className="flex-1">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {(isLoading || isStreaming) && messages[messages.length - 1]?.role !== "ASSISTANT" && (
            <div className="flex justify-start mb-4">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Control Drawer Footer */}
      <div className="p-3 border-t border-white/5 bg-gradient-to-t from-[hsl(30,10%,13%)] to-[hsl(30,12%,10%)] shrink-0 flex flex-col gap-2">
        <QuickTapButtons onTap={handleQuickTap} disabled={isLoading || isStreaming} />

        <form onSubmit={handleSend} className="flex gap-2 items-center mt-1">
          <div className="flex-1 input-premium flex items-center px-3 py-1">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Ask Zara... (e.g. "I want light starters")`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading || isStreaming}
              className="w-full text-xs text-white bg-transparent outline-none py-1.5 placeholder-[hsl(220,10%,45%)] font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isStreaming}
            className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-all no-min-size shrink-0 ${
              inputText.trim() && !isLoading && !isStreaming
                ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "bg-[hsl(30,10%,13%)] text-[hsl(220,10%,40%)] border border-white/5 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4 no-min-size" />
          </button>
        </form>

        {isStreaming && (
          <button
            type="button"
            onClick={cancelStream}
            className="mx-auto text-[9px] text-[hsl(220,10%,50%)] hover:text-white transition-colors py-0.5 no-min-size flex items-center gap-1 select-none cursor-pointer"
          >
            <AlertTriangle className="w-2.5 h-2.5 text-amber-500 no-min-size animate-pulse" />
            <span>Stop somatic streaming</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[hsl(30,16%,6%)]">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="fixed top-[-20%] right-[-10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full opacity-[0.08] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(28,95%,53%), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="fixed bottom-[-15%] left-[-10%] w-[65vw] h-[65vw] max-w-[600px] max-h-[600px] rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(45,96%,60%), transparent 70%)",
        }}
      />

      {/* Immersive Sticky Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong px-4 py-3 flex items-center justify-between border-b border-white/5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_16px_hsla(24,95%,53%,0.4)] no-min-size">
            <UtensilsCrossed className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none tracking-tight md:text-2xl">
              {process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Spice Garden"}
            </h1>
            <p className="text-[10px] text-orange-400 font-extrabold mt-0.5 uppercase tracking-widest">Zara AI Host</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="live">
            <span>Sync Live</span>
          </Badge>
          <Badge variant="default" className="gap-1 bg-white/5 border-white/5 text-[hsl(220,10%,70%)]">
            <span>Table {tableId}</span>
          </Badge>
        </div>
      </motion.header>

      {/* Main Container */}
      <div className="w-full flex justify-center">
        <main className="relative z-10 px-4 pt-5 pb-32 max-w-7xl w-full">
          
          {/* Greeting Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[hsla(24,95%,53%,0.12)] to-[hsla(340,82%,57%,0.04)] border border-[hsla(24,95%,53%,0.15)] mb-4 shadow-md"
          >
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                className="text-2.5xl no-min-size"
              >
                {greeting.emoji}
              </motion.span>
              <div>
                <p className="text-xs font-black text-white leading-none">{greeting.text}</p>
                <p className="text-[10px] text-[hsl(220,10%,55%)] mt-1.5">
                  Welcome to table <span className="text-orange-400 font-bold">{tableId}</span>.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5 text-center shrink-0">
              <div>
                <div className="flex items-center justify-center mb-0.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400 no-min-size" />
                </div>
                <p className="text-[9px] text-[hsl(220,10%,50%)]">Shared</p>
                <p className="text-[10px] font-bold text-white capitalize">{displayName || "Guest"}</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-400 no-min-size" />
                </div>
                <p className="text-[9px] text-[hsl(220,10%,50%)]">Wait</p>
                <p className="text-[10px] font-bold text-white">~15m</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-0.5">
                  <Star className="w-3.5 h-3.5 text-orange-400 no-min-size" fill="currentColor" />
                </div>
                <p className="text-[9px] text-[hsl(220,10%,50%)]">Rating</p>
                <p className="text-[10px] font-bold text-white">4.8</p>
              </div>
            </div>
          </motion.div>

          {/* Group Sync Banner */}
          <GroupBanner />

          {/* ─────────────────────────────────────────────────────────────────
              DESKTOP PANORAMIC LAYOUT (Side-by-Side Split screen)
              ───────────────────────────────────────────────────────────────── */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-8 mt-4 items-start">
            {/* Primary Left Column: Zara AI Sommelier */}
            <div className="md:col-span-5 lg:col-span-5 sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center no-min-size">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400 no-min-size" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Zara Sommelier Chat
                </h2>
              </div>
              {renderChatPanel()}
            </div>

            {/* Secondary Right Column: Digital Menu Catalog */}
            <div className="md:col-span-7 lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center no-min-size">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400 no-min-size" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Culinary Grid
                </h2>
              </div>
              
              {/* Wi-Fi widget */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[hsla(217,91%,60%,0.07)] border border-[hsla(217,91%,60%,0.15)] shadow-sm">
                <Wifi className="w-4 h-4 text-blue-400 shrink-0 no-min-size" aria-hidden="true" />
                <p className="text-xs text-[hsl(220,10%,55%)]">
                  Free Guest Wi-Fi: <span className="text-white font-bold">SpiceGarden_Guest</span> · No password
                </p>
              </div>

              {/* Menu content */}
              <div className="glass-premium p-4 rounded-2xl border border-white/5 shadow-lg">
                <MenuGrid tableId={tableId} />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              MOBILE LAYOUT (Immersive Swipe Hub / Segment Pill swapper)
              ───────────────────────────────────────────────────────────────── */}
          <div className="md:hidden mt-4 space-y-4">
            {/* Sliding Pill Tab Switcher */}
            <div className="w-full flex bg-[hsl(30,12%,10%)] border border-white/5 p-1 rounded-2xl shadow-inner shrink-0 relative z-10 select-none">
              <button
                onClick={() => setActiveTab("zara")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer no-min-size ${
                  activeTab === "zara"
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md font-black"
                    : "text-[hsl(220,10%,60%)] hover:text-white"
                }`}
              >
                <MessageCircle className="w-4.5 h-4.5 no-min-size" />
                <span>Ask Zara AI</span>
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer no-min-size ${
                  activeTab === "menu"
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md font-black"
                    : "text-[hsl(220,10%,60%)] hover:text-white"
                }`}
              >
                <Menu className="w-4.5 h-4.5 no-min-size" />
                <span>Full Menu</span>
              </button>
            </div>

            {/* Tab content screens */}
            <AnimatePresence mode="wait">
              {activeTab === "zara" ? (
                <motion.div
                  key="tab-zara-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderChatPanel()}
                </motion.div>
              ) : (
                <motion.div
                  key="tab-menu-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Wi-Fi widget */}
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[hsla(217,91%,60%,0.07)] border border-[hsla(217,91%,60%,0.15)] shadow-sm">
                    <Wifi className="w-4 h-4 text-blue-400 shrink-0 no-min-size" aria-hidden="true" />
                    <p className="text-xs text-[hsl(220,10%,55%)]">
                      Wi-Fi: <span className="text-white font-medium">SpiceGarden_Guest</span>
                    </p>
                  </div>
                  <MenuGrid tableId={tableId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </main>
      </div>

      {/* Floating Shared Table Cart Drawer */}
      <CartDrawer />

      {/* Diner Identification & Profile Onboarding Overlay */}
      <GreeterModal tableId={tableId} />
    </div>
  );
}
