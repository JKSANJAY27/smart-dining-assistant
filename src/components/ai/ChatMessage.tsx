"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { SuggestionCards } from "./SuggestionCards";
import type { ChatMessage as ChatMessageType } from "@/hooks/useAIChat";
import { UtensilsCrossed } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Basic markdown bold/italic parsing helper to keep rendering extremely clean and fast without heavy marked dependency
function formatMessageContent(content: string) {
  if (!content) return "";
  
  // Format linebreaks
  const lines = content.split("\n");
  
  return lines.map((line, lineIdx) => {
    // Replace **text** with bold tags
    let formattedLine = line;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(line)) !== null) {
      // Push text before match
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      // Push bold tag
      parts.push(
        <strong key={`bold-${match.index}`} className="text-orange-400 font-bold">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <p key={`line-${lineIdx}`} className="text-[13.5px] text-white/95 leading-relaxed mt-1.5 first:mt-0 font-medium">
        {parts.length > 0 ? parts : line}
      </p>
    );
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isZara = message.role === "ASSISTANT";
  const suggestions = message.metadata?.recommendedItems || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex gap-3 mb-4.5 ${isZara ? "justify-start" : "justify-end"}`}
    >
      {/* Avatar on Left for Zara */}
      {isZara && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_12px_hsla(24,95%,53%,0.3)] shrink-0 no-min-size">
          <UtensilsCrossed className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[82%] flex flex-col ${isZara ? "items-start" : "items-end"}`}>
        <div
          className={`p-3.5 rounded-2xl text-[12px] shadow-sm ${
            isZara
              ? "chat-bubble-zara"
              : "chat-bubble-user"
          }`}
        >
          {formatMessageContent(message.content)}
        </div>

        {/* Suggestion Cards Carousel (appended below Zara's speech) */}
        {isZara && suggestions.length > 0 && (
          <div className="w-full mt-2">
            <SuggestionCards items={suggestions} />
          </div>
        )}
      </div>

      {/* Avatar on Right for User */}
      {!isZara && (
        <Avatar
          size="sm"
          fallback="Guest"
          className="border border-[hsla(220,15%,95%,0.1)] shadow-sm shrink-0"
        />
      )}
    </motion.div>
  );
}
