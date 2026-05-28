"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, User, Flame, Sparkles, Check, Heart, ShieldAlert } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface GreeterModalProps {
  tableId: string;
}

export function GreeterModal({ tableId }: GreeterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [diet, setDiet] = useState<"veg" | "non-veg" | "none">("none");
  const [spice, setSpice] = useState<"mild" | "medium" | "hot">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sessionId, setSession, displayName } = useCartStore();

  useEffect(() => {
    if (!sessionId || !displayName || displayName === "Guest") {
      setIsOpen(true);
    }
  }, [sessionId, displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please tell us your name so Chef Zara can welcome you!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Fetch/Initialize the Table Session
      const res = await fetch(`/api/table/${tableId}/session`);
      if (!res.ok) throw new Error("Failed to initialize session");
      
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to initialize session");

      const activeSessionId = json.data.sessionId;

      // 2. Pre-seed the AI preferences if they picked dietary/spice bounds
      if (diet !== "none" || spice !== "medium") {
        try {
          const prefData: Record<string, any> = {};
          if (diet !== "none") prefData.dietPreference = diet;
          prefData.spiceLevel = spice;
          prefData.onboardingCompleted = true; // Skip verbal onboarding step since they did it in the GUI!
          prefData.onboardingStep = 3;

          await fetch(`/api/session/${activeSessionId}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seedPreferences: prefData,
            }),
          });
        } catch (prefErr) {
          console.warn("Preferences seeding warning:", prefErr);
        }
      }

      // 3. Save details locally in Zustand store
      setSession(activeSessionId, tableId, name.trim());
      
      toast.success(`Welcome to Table ${tableId}, ${name.trim()}!`, {
        description: "Your live group session and AI Sommelier are active.",
        duration: 3500,
      });

      setIsOpen(false);
    } catch (err: any) {
      console.error("❌ Onboarding failed:", err);
      toast.error("Failed to connect to the table. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Backdrop overlay with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-[14px]"
        />

        {/* Modal Panel - Gorgeous glassmorphic reservation card style */}
        <motion.div
          initial={{ scale: 0.93, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.93, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="relative z-50 w-full max-w-md glass-premium p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-y-auto max-h-[92dvh] border border-white/10"
        >
          {/* Subtle neon glowing backdrops for luxury atmosphere */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[2px] no-min-size" />

          {/* Header logo & Greeting */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_24px_hsla(24,95%,53%,0.5)] mb-3.5 no-min-size">
              <UtensilsCrossed className="w-6.5 h-6.5 text-white" />
            </div>
            <h2 className="text-xl font-black text-white leading-tight tracking-tight">
              Welcome to <span className="text-gradient-brand">Spice Garden</span>
            </h2>
            <p className="text-[10px] text-[hsl(220,10%,55%)] mt-1.5 max-w-[280px] leading-relaxed">
              Step into an AI-first dining somatic journey. Zara, our AI Sommelier, will personalize your culinary table.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Input Name with interactive outline */}
            <div>
              <label htmlFor="diner-name" className="block text-[9px] font-extrabold uppercase tracking-wider text-[hsl(220,10%,55%)] mb-1.5">
                Diner Name (Required)
              </label>
              <div className="input-premium flex items-center px-3.5 py-2 gap-2.5">
                <User className="w-4 h-4 text-[hsl(220,10%,45%)] shrink-0 no-min-size" />
                <input
                  id="diner-name"
                  type="text"
                  placeholder="Tell us your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  disabled={isSubmitting}
                  className="w-full text-xs text-white bg-transparent outline-none py-1.5 placeholder-[hsl(220,10%,40%)] font-medium"
                  required
                />
              </div>
            </div>

            {/* Diet chips - transformed into gorgeous tactile selection cards */}
            <div>
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[hsl(220,10%,55%)] mb-2">
                Dietary Preference
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "none", label: "Anything", emoji: "🍽️", theme: "hover:border-orange-500/30", active: "bg-orange-500/10 border-orange-500/70 text-orange-400" },
                  { id: "veg", label: "Pure Veg", emoji: "🥬", theme: "hover:border-emerald-500/30", active: "bg-emerald-500/10 border-emerald-500/70 text-emerald-400" },
                  { id: "non-veg", label: "Non-Veg", emoji: "🍗", theme: "hover:border-rose-500/30", active: "bg-rose-500/10 border-rose-500/70 text-rose-400" },
                ].map((option) => {
                  const isActive = diet === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDiet(option.id as any)}
                      disabled={isSubmitting}
                      className={`relative py-3.5 px-1 rounded-xl text-[10px] font-black border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer no-min-size shadow-sm select-none ${
                        isActive 
                          ? `${option.active} scale-[1.03] shadow-md` 
                          : `bg-[hsl(220,16%,14%)] border-[hsla(220,15%,95%,0.05)] text-[hsl(220,10%,60%)] ${option.theme}`
                      }`}
                    >
                      <span className="text-sm">{option.emoji}</span>
                      <span>{option.label}</span>
                      
                      {isActive && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-current flex items-center justify-center p-0.5 no-min-size">
                          <Check className="w-full h-full text-[hsl(220,20%,7%)] stroke-[4]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spice level chips - styled as tactile flame gauges */}
            <div>
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[hsl(220,10%,55%)] mb-2">
                Preferred Spice Level
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "mild", label: "Mild", desc: "No spice", active: "bg-emerald-500/10 border-emerald-500/70 text-emerald-400" },
                  { id: "medium", label: "Medium", desc: "Balanced", active: "bg-orange-500/10 border-orange-500/70 text-orange-400" },
                  { id: "hot", label: "Hot 🌶️", desc: "Very tikha", active: "bg-rose-500/10 border-rose-500/70 text-rose-400" },
                ].map((option) => {
                  const isActive = spice === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSpice(option.id as any)}
                      disabled={isSubmitting}
                      className={`relative py-3 px-1 rounded-xl text-[10px] font-black border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer no-min-size shadow-sm select-none ${
                        isActive 
                          ? `${option.active} scale-[1.03] shadow-md` 
                          : "bg-[hsl(220,16%,14%)] border-[hsla(220,15%,95%,0.05)] text-[hsl(220,10%,60%)] hover:border-orange-500/30"
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className="text-[8px] text-[hsl(220,10%,45%)] mt-0.5 font-medium">{option.desc}</span>
                      
                      {isActive && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-current flex items-center justify-center p-0.5 no-min-size">
                          <Check className="w-full h-full text-[hsl(220,20%,7%)] stroke-[4]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit button with luxury glow and sparkles */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className={`w-full py-3 rounded-xl font-extrabold text-[12px] flex items-center justify-center gap-2 transition-all duration-300 border border-white/10 ${
                  name.trim() && !isSubmitting
                    ? "bg-gradient-to-br from-orange-500 to-rose-500 hover:opacity-95 shadow-[0_0_24px_rgba(249,115,22,0.45)] cursor-pointer text-white"
                    : "bg-[hsl(220,16%,14%)] border border-[hsla(220,15%,95%,0.04)] text-[hsl(220,10%,40%)] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin no-min-size" />
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                    <span>Enter Dining Room</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
