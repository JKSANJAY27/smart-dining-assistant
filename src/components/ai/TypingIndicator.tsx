"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[hsl(220,18%,13%)] border border-[hsla(220,15%,95%,0.04)] w-fit mt-1 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 typing-dot no-min-size" />
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 typing-dot no-min-size" />
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 typing-dot no-min-size" />
    </div>
  );
}
