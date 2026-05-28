"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, AlertTriangle } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import { ChatMessage } from "./ChatMessage";
import { QuickTapButtons } from "./QuickTapButtons";
import { TypingIndicator } from "./TypingIndicator";
import { useCartStore } from "@/store/cartStore";

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const { messages, isLoading, isStreaming, sendMessage, cancelStream } = useAIChat();
  const { displayName } = useCartStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom of the chat thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

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

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-12.5 h-12.5 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_24px_rgba(249,115,22,0.55)] cursor-pointer no-min-size border border-white/10 glow-brand"
        aria-label="Chat with Zara"
      >
        <Sparkles className="w-5.5 h-5.5 animate-pulse" />
        {/* Pulsing unread dot for styling */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[hsl(220,20%,7%)] animate-pulse no-min-size" />
      </motion.button>

      {/* Slide-Up Chat Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.8 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md mx-auto h-[82dvh] rounded-t-2xl glass shadow-2xl flex flex-col overflow-hidden border-t border-[hsla(220,15%,95%,0.12)]"
            >
              {/* Drawer Top Handle for drag visual */}
              <div className="w-12 h-1 bg-[hsla(220,15%,95%,0.15)] rounded-full mx-auto mt-2 shrink-0" />

              {/* Drawer Header */}
              <header className="px-4 py-3 flex items-center justify-between border-b border-[hsla(220,15%,95%,0.05)] shrink-0 bg-gradient-to-b from-[hsl(220,18%,11%)] to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_12px_hsla(24,95%,53%,0.35)] no-min-size">
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1 leading-none">
                      Zara Sommelier
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse no-min-size" />
                    </h3>
                    <p className="text-[10px] text-[hsl(220,10%,55%)] mt-0.5">Dining Assistant & Host</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[hsla(220,15%,95%,0.06)] text-[hsl(220,10%,60%)] hover:text-white transition-colors cursor-pointer no-min-size"
                >
                  <X className="w-4 h-4 no-min-size" />
                </button>
              </header>

              {/* Conversation Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none flex flex-col">
                <div className="flex-1">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {(isLoading || isStreaming) && messages[messages.length - 1]?.role !== "ASSISTANT" && (
                    <div className="flex justify-start mb-4">
                      <div className="flex flex-col items-start gap-1">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Suggestions Drawer Footer */}
              <footer className="border-t border-[hsla(220,15%,95%,0.04)] p-3 bg-gradient-to-t from-[hsl(220,18%,13%)] to-[hsl(220,18%,11%)] shrink-0 flex flex-col gap-2">
                {/* Scrollable Quick Tap Queries */}
                <QuickTapButtons onTap={handleQuickTap} disabled={isLoading || isStreaming} />

                {/* Input Form Box */}
                <form onSubmit={handleSend} className="flex gap-2 items-center mt-1">
                  <div className="flex-1 relative flex items-center bg-[hsl(220,16%,15%)] rounded-xl border border-[hsla(220,15%,95%,0.08)] focus-within:border-orange-500/40 px-3 py-1">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={`Ask Zara... (e.g. "I want spicy curries")`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isLoading || isStreaming}
                      className="w-full text-[12px] text-white bg-transparent outline-none py-1.5 placeholder-[hsl(220,10%,45%)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading || isStreaming}
                    className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-all no-min-size shrink-0 ${
                      inputText.trim() && !isLoading && !isStreaming
                        ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                        : "bg-[hsl(220,16%,14%)] text-[hsl(220,10%,40%)] border border-[hsla(220,15%,95%,0.04)] cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4 no-min-size" />
                  </button>
                </form>

                {/* Stream Cancel Button for premium user safety */}
                {isStreaming && (
                  <button
                    type="button"
                    onClick={cancelStream}
                    className="mx-auto text-[9px] text-[hsl(220,10%,55%)] hover:text-white transition-colors py-0.5 no-min-size flex items-center gap-1 select-none"
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-500 no-min-size" />
                    <span>Stop Zara's response stream</span>
                  </button>
                )}
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
