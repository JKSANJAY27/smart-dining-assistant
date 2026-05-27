import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in INR */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Calculate GST (5% for food items, 12% for premium) */
export function calculateGST(
  amount: number,
  rate: 5 | 12 = 5
): { base: number; gst: number; total: number } {
  const gst = Math.round(amount * (rate / 100));
  return { base: amount, gst, total: amount + gst };
}

/** Get time of day category */
export function getTimeOfDay(): "breakfast" | "lunch" | "evening" | "dinner" | "late" {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 12) return "breakfast";
  if (hour >= 12 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 19) return "evening";
  if (hour >= 19 && hour < 23) return "dinner";
  return "late";
}

/** Truncate text to max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Generate initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Generate a random display name for anonymous users */
export function generateDisplayName(): string {
  const adjectives = ["Hungry", "Spicy", "Happy", "Quick", "Foodie"];
  const nouns = ["Panda", "Tiger", "Eagle", "Wizard", "Chef"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

/** Format estimated wait time */
export function formatWaitTime(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes === 1) return "1 min";
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${minutes} mins`;
}

/** Get a stable session display name from sessionStorage */
export function getOrCreateDisplayName(): string {
  if (typeof window === "undefined") return "Guest";
  const key = "dining_display_name";
  let name = sessionStorage.getItem(key);
  if (!name) {
    name = generateDisplayName();
    sessionStorage.setItem(key, name);
  }
  return name;
}
