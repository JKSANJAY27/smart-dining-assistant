"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, User, Flame, Sparkles } from "lucide-react";
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
    // If there is no active session or the display name is still default ("Guest" or empty), open onboarding
    if (!sessionId || !displayName || displayName === "Guest") {
      setIsOpen(true);
    }
  }, [sessionId, displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name to start dining!");
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
          // Send initial settings to the chat API or save locally in DB
          // By calling the AI chat init endpoint with a pre-saved message in the body
          const prefData: Record<string, any> = {};
          if (diet !== "none") prefData.dietPreference = diet;
          prefData.spiceLevel = spice;
          prefData.onboardingCompleted = true; // Complete LLM onboarding step instantly since they set it here!
          prefData.onboardingStep = 3;

          await fetch(`/api/session/${activeSessionId}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seedPreferences: prefData,
            }),
          }).catch(err => console.warn("Failed to seed preferences in DB:", err));
        } catch (prefErr) {
          console.warn("Preferences seeding warning:", prefErr);
        }
      }

      // 3. Save details locally in Zustand store
      setSession(activeSessionId, tableId, name.trim());
      
      toast.success(`Welcome to Table ${tableId}, ${name.trim()}!`, {
        description: "Your live group session and AI Sommelier are active.",
        duration: 3000,
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
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative z-50 w-full max-w-md bg-[hsl(220,18%,11%)] border border-[hsla(220,15%,95%,0.12)] p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90dvh]"
        >
          {/* Header logo */}
          <div className="flex flex-col items-center text-center mb-5.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_24px_hsla(24,95%,53%,0.45)] mb-3 no-min-size">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-black text-white leading-tight">Welcome to Spice Garden</h2>
            <p className="text-[11px] text-[hsl(220,10%,55%)] mt-1.5 max-w-[280px]">
              AI-Powered Dining experience with real-time ordering and live group sync.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Name */}
            <div>
              <label htmlFor="diner-name" className="block text-[10px] font-bold uppercase tracking-wider text-[hsl(220,10%,60%)] mb-1.5">
                Your Display Name
              </label>
              <div className="flex items-center bg-[hsl(220,16%,15%)] border border-[hsla(220,15%,95%,0.08)] rounded-xl focus-within:border-orange-500/40 px-3.5 py-1.5 gap-2.5">
                <User className="w-4 h-4 text-[hsl(220,10%,50%)] shrink-0 no-min-size" />
                <input
                  id="diner-name"
                  type="text"
                  placeholder="E.g., Sanjay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={25}
                  disabled={isSubmitting}
                  className="w-full text-xs text-white bg-transparent outline-none py-1 placeholder-[hsl(220,10%,40%)]"
                  required
                />
              </div>
            </div>

            {/* Diet chips */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[hsl(220,10%,60%)] mb-2">
                Dietary Preference (Optional)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "none", label: "🍽️ Anything" },
                  { id: "veg", label: "🥬 Veg Only" },
                  { id: "non-veg", label: "🍗 Non-Veg" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDiet(option.id as any)}
                    disabled={isSubmitting}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer no-min-size ${
                      diet === option.id
                        ? "bg-orange-500/15 border-orange-500 text-orange-400 font-black shadow-sm"
                        : "bg-[hsl(220,16%,15%)] border-[hsla(220,15%,95%,0.05)] text-[hsl(220,10%,65%)] hover:bg-[hsl(220,16%,18%)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spice level chips */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[hsl(220,10%,60%)] mb-2">
                Preferred Spice Level (Optional)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mild", label: "Mild" },
                  { id: "medium", label: "Medium" },
                  { id: "hot", label: "Hot 🌶️" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSpice(option.id as any)}
                    disabled={isSubmitting}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer no-min-size ${
                      spice === option.id
                        ? "bg-orange-500/15 border-orange-500 text-orange-400 font-black shadow-sm"
                        : "bg-[hsl(220,16%,15%)] border-[hsla(220,15%,95%,0.05)] text-[hsl(220,10%,65%)] hover:bg-[hsl(220,16%,18%)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-white ${
                  name.trim() && !isSubmitting
                    ? "bg-gradient-to-br from-orange-500 to-rose-500 hover:opacity-95 shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer"
                    : "bg-[hsl(220,16%,14%)] border border-[hsla(220,15%,95%,0.04)] text-[hsl(220,10%,45%)] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin no-min-size" />
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>Join Dining Table</span>
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
