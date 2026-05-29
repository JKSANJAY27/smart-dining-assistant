"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, MessageCircle } from "lucide-react";
import { ZaraPanel } from "./ZaraPanel";
import { cn } from "@/lib/utils";

interface FloatingAIAssistantProps {
  messages: any[];
  isLoading: boolean;
  isStreaming: boolean;
  inputText: string;
  onInputChange: (v: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onCancelStream: () => void;
  onQuickTap: (query: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  displayName?: string;
}

export function FloatingAIAssistant({
  messages,
  isLoading,
  isStreaming,
  inputText,
  onInputChange,
  onSend,
  onCancelStream,
  onQuickTap,
  messagesEndRef,
  inputRef,
  displayName,
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  // Intercept onQuickTap to open assistant if it's closed
  const handleQuickTapAndOpen = (query: string) => {
    setIsOpen(true);
    onQuickTap(query);
  };

  return (
    <>
      {/* Floating AI FAB Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={handleToggle}
            className="fixed bottom-6 right-6 z-50 w-15 h-15 rounded-full bg-gradient-to-br from-amber-400 via-[#D97706] to-orange-600 shadow-xl flex items-center justify-center text-white cursor-pointer select-none ring-4 ring-white focus:outline-none"
            aria-label="Open Zara Assistant"
          >
            {/* Pulsing indicator */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-[#D97706] animate-ping opacity-25 scale-110 pointer-events-none" />
            
            <Sparkles className="w-6 h-6 animate-pulse" />

            {/* Unread dot */}
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm">
                {messages.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur click target */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={handleToggle}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />

            {/* Slide-Up / Slide-Left Drawer Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:max-w-[440px] h-[80vh] md:h-[70vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-[#EBE3D5] flex flex-col overflow-hidden"
            >
              {/* Drawer Header Close Bar for Touch */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#F0EBE3] bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <span>Consulting Zara</span>
                </div>
                <button
                  onClick={handleToggle}
                  className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close Assistant"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Chat Panel context */}
              <div className="flex-1 overflow-hidden">
                <ZaraPanel
                  messages={messages}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  inputText={inputText}
                  onInputChange={onInputChange}
                  onSend={onSend}
                  onCancelStream={onCancelStream}
                  onQuickTap={handleQuickTapAndOpen}
                  messagesEndRef={messagesEndRef}
                  inputRef={inputRef}
                  displayName={displayName}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
