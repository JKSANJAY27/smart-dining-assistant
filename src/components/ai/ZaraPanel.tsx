"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, AlertTriangle } from "lucide-react";
import { AIWave } from "@/components/ui/AIWave";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { TypingIndicator } from "@/components/ai/TypingIndicator";

interface ZaraPanelProps {
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

const QUICK_CHIPS = [
  { label: "🌿 Veg picks", query: "Show me vegetarian options" },
  { label: "🔥 Spicy!", query: "What are your spiciest dishes?" },
  { label: "⭐ Best sellers", query: "What are the bestsellers here?" },
  { label: "⚡ Quick serve", query: "Quick items under 15 minutes" },
  { label: "🍰 Desserts", query: "What desserts do you recommend?" },
  { label: "🥗 Light meals", query: "Light and healthy options please" },
];

export function ZaraPanel({
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
}: ZaraPanelProps) {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Panel Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#F0EBE3] shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#D97706] flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Zara</p>
            <p className="text-[11px] font-medium leading-tight" style={{
              color: isStreaming ? "#D97706" : isLoading ? "#D97706" : "#9CA3AF"
            }}>
              {isStreaming ? "Thinking…" : isLoading ? "Loading…" : "AI Dining Concierge"}
            </p>
          </div>
          <div className="ml-auto">
            <AIWave state={isStreaming ? "streaming" : isLoading ? "thinking" : "idle"} />
          </div>
        </div>

        {/* Quick tap chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => onQuickTap(chip.query)}
              disabled={isLoading || isStreaming}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 bg-[#FAF7F2] border border-[#EBE3D5] hover:border-[#D97706]/40 hover:text-[#B45309] transition-all shrink-0 cursor-pointer select-none disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>
        {!hasMessages ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-3xl border border-amber-100 shadow-sm">
              🍽️
            </div>
            <div className="max-w-xs">
              <p className="font-bold text-gray-800 text-sm">
                Hi{displayName ? ` ${displayName}` : ""}! I&apos;m Zara 👋
              </p>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                Ask me anything — I can recommend dishes, find options for your diet, avoid allergens, and curate the perfect meal.
              </p>
            </div>

            {/* Suggestion tiles for empty state */}
            <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
              {[
                { icon: "🌟", label: "What's trending\ntoday?" },
                { icon: "🌶️", label: "Something spicy\nand bold" },
                { icon: "🥗", label: "Light starters\nfor the table" },
                { icon: "🍰", label: "Best desserts\nto end with" },
              ].map((tile) => (
                <button
                  key={tile.label}
                  onClick={() => onQuickTap(tile.label.replace("\n", " "))}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3D5] hover:border-[#D97706]/30 hover:bg-amber-50/50 transition-all cursor-pointer text-left"
                >
                  <span className="text-xl">{tile.icon}</span>
                  <span className="text-[11px] font-medium text-gray-600 leading-snug text-center whitespace-pre-line">
                    {tile.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {(isLoading || isStreaming) &&
              messages[messages.length - 1]?.role !== "ASSISTANT" && (
                <div className="flex justify-start pt-1">
                  <TypingIndicator />
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input footer */}
      <div className="px-5 pb-5 pt-3 border-t border-[#F0EBE3] shrink-0">
        <form onSubmit={onSend} className="flex gap-2.5 items-center">
          <div className="flex-1 flex items-center bg-[#FAF7F2] border border-[#EBE3D5] rounded-2xl px-4 py-3 focus-within:border-[#D97706]/40 focus-within:ring-2 focus-within:ring-[#D97706]/10 transition-all">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Ask Zara… "Something light for two?"`}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={isLoading || isStreaming}
              className="w-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 font-medium leading-none"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isStreaming}
            aria-label="Send"
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              inputText.trim() && !isLoading && !isStreaming
                ? "bg-[#D97706] hover:bg-[#B45309] text-white shadow-sm cursor-pointer"
                : "bg-[#F5EFE6] text-gray-300 border border-[#EBE3D5] cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {isStreaming && (
          <button
            type="button"
            onClick={onCancelStream}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            Stop generating
          </button>
        )}
      </div>
    </div>
  );
}
