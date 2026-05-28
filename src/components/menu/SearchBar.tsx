"use client";

import { Search, X, Mic, MicOff } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const { filter, setSearchQuery } = useMenuStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = filter.searchQuery;

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
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
          toast.info("Listening to your craving...", { id: "voice-search", duration: 4000 });
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setSearchQuery(transcript);
            toast.success(`Craving set: "${transcript}"`, { id: "voice-search" });
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          toast.error("Could not understand. Please try again.", { id: "voice-search" });
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [setSearchQuery]);

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-4 select-none">
      {/* Search icon left */}
      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
        <Search className="w-5.5 h-5.5 text-gray-400" aria-hidden="true" />
      </div>

      <input
        ref={inputRef}
        id="menu-search"
        type="search"
        value={query}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Describe what you're craving... Ask Zara"
        aria-label="Search menu items"
        style={{ paddingLeft: "54px", paddingRight: query ? "84px" : "54px" }}
        className="w-full h-15 rounded-full text-base font-medium font-plus-jakarta bg-white text-gray-800 placeholder-gray-400 shadow-md outline-none border border-[#EBE3D5] focus:border-[#D97706]/40 focus:ring-4 focus:ring-[#D97706]/10 transition-all duration-200"
      />

      <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 z-10">
        {/* Clear search icon */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={handleClear}
              type="button"
              aria-label="Clear search"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Voice Input icon */}
        <motion.button
          onClick={toggleListening}
          type="button"
          aria-label={isListening ? "Stop listening" : "Search using voice"}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer",
            isListening 
              ? "bg-rose-500 text-white animate-pulse" 
              : "bg-amber-500/10 text-[#D97706] hover:bg-amber-500/20"
          )}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
}
