"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Mic, MicOff, AlertTriangle, CornerDownLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "@/lib/utils";

interface EmbeddedConciergeProps {
  messages: any[];
  isLoading: boolean;
  isStreaming: boolean;
  inputText: string;
  onInputChange: (v: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onCancelStream: () => void;
  onQuickTap: (query: string) => void;
  displayName: string;
  tableId: string;
}

export function EmbeddedConcierge({
  messages,
  isLoading,
  isStreaming,
  inputText,
  onInputChange,
  onSend,
  onCancelStream,
  onQuickTap,
  displayName,
  tableId,
}: EmbeddedConciergeProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          toast.info("Zara is listening to your craving...", { id: "voice-crave" });
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onInputChange(transcript);
            toast.success(`Heard: "${transcript}"`, { id: "voice-crave" });
          }
        };

        rec.onerror = () => {
          setIsListening(false);
          toast.error("Zara couldn't hear clearly. Try again.", { id: "voice-crave" });
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [onInputChange]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Speech input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div 
      style={{ padding: "32px", borderRadius: "32px" }}
      className="relative overflow-hidden w-full bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] border border-[#EBE3D5] shadow-lg mb-10 select-none text-left"
    >
      {/* Design elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-3xl pointer-events-none" />
      
      {/* Header Concierge Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EBE3D5]/60 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-[#D97706] to-orange-600 flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <h2 className="text-lg font-black font-plus-jakarta text-gray-950 leading-none">
              Zara • AI Dining Agent
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
              {isStreaming ? "Formulating culinary matches..." : isLoading ? "Consulting chef algorithms..." : "Active Concierge • Table " + tableId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {[
            { label: "🔥 Spicy Cravings", query: "Show me spiciest mains" },
            { label: "🌱 Pure Veg", query: "What are the best vegetarian options?" },
            { label: "⚡ Quick Serve", query: "What can be prepared in under 15 minutes?" }
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => onQuickTap(chip.query)}
              className="no-min-size px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#EBE3D5] text-gray-700 hover:border-[#D97706] hover:text-[#B45309] transition-all cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream Box */}
      <div 
        style={{ height: "480px", padding: "16px" }}
        className="w-full rounded-2xl bg-white/60 border border-[#EBE3D5]/40 overflow-y-auto mb-6 flex flex-col gap-4 scrollbar-none"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl border border-amber-100/50 shadow-2xs">
              🍽️
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-950 font-plus-jakarta">
                Welcome to Spice Garden, {displayName || "Guest"}!
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed font-medium">
                I am your primary dining companion. Tell me what you are in the mood for, describe a craving, or ask for dynamic pairings. I will adapt the menu below to suit your taste.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {(isLoading || isStreaming) &&
              messages[messages.length - 1]?.role !== "ASSISTANT" && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Primary Crave Input Bar */}
      <form onSubmit={onSend} className="space-y-3">
        <div className="relative flex items-center bg-white border border-[#EBE3D5] rounded-2xl p-2.5 shadow-xs focus-within:border-[#D97706] focus-within:ring-4 focus-within:ring-[#D97706]/10 transition-all">
          <input
            type="text"
            placeholder="Type or speak what you're craving (e.g. 'Something light and tangy with chicken')"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isLoading || isStreaming}
            className="w-full pl-3 pr-24 py-2 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 font-medium"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Microphone search */}
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "no-min-size flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer",
                isListening 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "bg-amber-500/10 text-[#D97706] hover:bg-amber-500/20"
              )}
              aria-label="Speak craving"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading || isStreaming}
              className={cn(
                "no-min-size w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                inputText.trim() && !isLoading && !isStreaming
                  ? "bg-[#D97706] hover:bg-[#B45309] text-white cursor-pointer"
                  : "bg-stone-100 text-stone-300 cursor-not-allowed"
              )}
              aria-label="Send craving"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isStreaming && (
          <button
            type="button"
            onClick={onCancelStream}
            className="no-min-size flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold hover:text-rose-700 transition-colors mx-auto cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Stop generating response
          </button>
        )}
      </form>
    </div>
  );
}
