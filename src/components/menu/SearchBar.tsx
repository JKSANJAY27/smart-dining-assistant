"use client";

import { Search, X } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

export function SearchBar() {
  const { filter, setSearchQuery } = useMenuStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = filter.searchQuery;

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-[hsl(220,10%,45%)]" aria-hidden="true" />
      </div>
      <input
        ref={inputRef}
        id="menu-search"
        type="search"
        value={query}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search menu... try 'spicy paneer' or 'light snack'"
        aria-label="Search menu items"
        className={[
          "w-full h-11 pl-10 pr-10 rounded-xl text-sm",
          "bg-[hsl(220,16%,15%)] border border-[hsla(220,15%,95%,0.1)]",
          "text-[hsl(220,15%,95%)] placeholder-[hsl(220,8%,40%)]",
          "focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30",
          "transition-all duration-200",
        ].join(" ")}
      />
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-3 flex items-center justify-center no-min-size w-6 h-6 my-auto rounded-full bg-[hsla(220,15%,95%,0.1)] hover:bg-[hsla(220,15%,95%,0.2)] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[hsl(220,10%,60%)]" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
