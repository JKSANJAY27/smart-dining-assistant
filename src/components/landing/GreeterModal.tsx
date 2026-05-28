"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, User, Sparkles, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface GreeterModalProps {
  tableId: string;
}

type Step = "welcome" | "preferences";

const MOOD_CHIPS = [
  { id: "light", label: "Light & Healthy", emoji: "🥗" },
  { id: "spicy", label: "Spicy & Bold", emoji: "🔥" },
  { id: "sweet", label: "Something Sweet", emoji: "🍰" },
  { id: "filling", label: "Heavy & Filling", emoji: "🥘" },
  { id: "surprise", label: "Surprise Me!", emoji: "✨" },
];

const DIET_OPTIONS = [
  { id: "none", label: "Everything", emoji: "🍽️" },
  { id: "veg", label: "Pure Veg", emoji: "🥬" },
  { id: "non-veg", label: "Non-Veg", emoji: "🍗" },
];

export function GreeterModal({ tableId }: GreeterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [diet, setDiet] = useState<"veg" | "non-veg" | "none">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sessionId, setSession, displayName } = useCartStore();

  useEffect(() => {
    if (!sessionId || !displayName || displayName === "Guest") {
      setIsOpen(true);
    }
  }, [sessionId, displayName]);

  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please tell us your name!");
      return;
    }
    setStep("preferences");
  };

  const handleFinish = async (browseMode = false) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/table/${tableId}/session`);
      if (!res.ok) throw new Error("Failed to initialize session");

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Session error");

      const activeSessionId = json.data.sessionId;

      // Seed preferences from the greeter into AI context
      try {
        const prefData: Record<string, any> = {
          onboardingCompleted: true,
          onboardingStep: 3,
        };
        if (diet !== "none") prefData.dietPreference = diet;
        if (mood) prefData.mood = mood;
        if (browseMode) prefData.browseMode = true;

        await fetch(`/api/session/${activeSessionId}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seedPreferences: prefData }),
        });
      } catch (prefErr) {
        console.warn("Preference seeding warn:", prefErr);
      }

      setSession(activeSessionId, tableId, name.trim());

      toast.success(`Welcome, ${name.trim()}! 🎉`, {
        description: browseMode
          ? "Browse freely. Tap Zara anytime for help!"
          : "Zara is ready to build your perfect meal.",
        duration: 3000,
      });

      setIsOpen(false);
    } catch (err: any) {
      console.error("Onboarding error:", err);
      toast.error("Failed to connect. Please refresh.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          style={{ backdropFilter: "blur(8px)" }}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-[#D97706] to-orange-500" />

          <div className="p-7">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Welcome + Name ──────────────── */}
              {step === "welcome" && (
                <motion.div
                  key="step-welcome"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Zara avatar */}
                  <div className="flex flex-col items-center text-center mb-7">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-[#D97706] flex items-center justify-center shadow-lg mb-4">
                      <UtensilsCrossed className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      Welcome to{" "}
                      <span className="text-[#D97706]">
                        {process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Spice Garden"}
                      </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 max-w-xs leading-relaxed">
                      I&apos;m <strong className="text-gray-700">Zara</strong>, your AI dining concierge. Let me personalize your experience!
                    </p>
                  </div>

                  <form onSubmit={handleNameNext} className="space-y-5">
                    <div>
                      <label htmlFor="diner-name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Your Name
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] focus-within:border-[#D97706]/50 focus-within:ring-2 focus-within:ring-[#D97706]/10 transition-all">
                        <User className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                        <input
                          id="diner-name"
                          type="text"
                          placeholder="What shall I call you?"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          maxLength={25}
                          autoFocus
                          className="w-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!name.trim()}
                      className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2: Mood + Diet ─────────────────── */}
              {step === "preferences" && (
                <motion.div
                  key="step-prefs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Zara greeting */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#D97706] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Hi {name}! 👋</p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        Quick question — what&apos;s the vibe today?
                      </p>
                    </div>
                  </div>

                  {/* Mood chips */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      I&apos;m in the mood for…
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {MOOD_CHIPS.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setMood(mood === chip.id ? null : chip.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                            mood === chip.id
                              ? "bg-[#D97706] border-[#D97706] text-white shadow-sm"
                              : "bg-[#FAF7F2] border-[#EBE3D5] text-gray-600 hover:border-[#D97706]/40"
                          }`}
                        >
                          <span className="text-xl">{chip.emoji}</span>
                          <span className="leading-tight text-center">{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diet preference */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Dietary preference
                    </p>
                    <div className="flex gap-2.5">
                      {DIET_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDiet(opt.id as any)}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                            diet === opt.id
                              ? "bg-[#D97706] border-[#D97706] text-white shadow-sm"
                              : "bg-[#FAF7F2] border-[#EBE3D5] text-gray-600 hover:border-[#D97706]/40"
                          }`}
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    <button
                      onClick={() => handleFinish(false)}
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-2xl font-semibold text-sm bg-[#D97706] hover:bg-[#B45309] text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Tell me what&apos;s good
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleFinish(true)}
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-2xl font-medium text-sm text-gray-500 hover:text-gray-700 border border-[#EBE3D5] hover:bg-[#FAF7F2] transition-all cursor-pointer"
                    >
                      Just browsing
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
