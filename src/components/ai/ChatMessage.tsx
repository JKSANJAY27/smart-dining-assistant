"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { SuggestionCards } from "./SuggestionCards";
import type { ChatMessage as ChatMessageType } from "@/hooks/useAIChat";
import { UtensilsCrossed } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Parse **bold** markdown inline
function parseInlineBold(text: string, isZara: boolean): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    parts.push(
      <strong
        key={`b-${match.index}`}
        className={isZara ? "text-[#D97706] font-bold" : "text-white font-bold"}
      >
        {match[1]}
      </strong>
    );
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isZara = message.role === "ASSISTANT";
  const suggestions = message.metadata?.recommendedItems || [];

  const lines = message.content.split("\n").filter((l) => l.trim() !== "" || false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex gap-3 mb-5 ${isZara ? "justify-start" : "justify-end"}`}
    >
      {/* Zara avatar */}
      {isZara && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#D97706] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col gap-2 ${isZara ? "items-start" : "items-end"}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isZara
              ? "bg-white border border-[#EBE3D5] shadow-sm rounded-tl-sm"
              : "bg-[#D97706] shadow-sm rounded-tr-sm"
          }`}
        >
          <div className="space-y-1.5">
            {lines.map((line, i) => (
              <p
                key={i}
                className={`text-sm leading-relaxed ${
                  isZara ? "text-gray-800" : "text-white"
                }`}
              >
                {parseInlineBold(line, isZara)}
              </p>
            ))}
          </div>
        </div>

        {/* Suggestion cards (Zara only) */}
        {isZara && suggestions.length > 0 && (
          <div className="w-full mt-1">
            <SuggestionCards items={suggestions} />
          </div>
        )}
      </div>

      {/* User avatar */}
      {!isZara && (
        <Avatar
          size="sm"
          fallback="Guest"
          className="border-2 border-white shadow-sm shrink-0 mt-0.5"
        />
      )}
    </motion.div>
  );
}
