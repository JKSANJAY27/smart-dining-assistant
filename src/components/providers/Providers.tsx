"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(220, 16%, 15%)",
            border: "1px solid hsla(220, 15%, 95%, 0.12)",
            color: "hsl(220, 15%, 95%)",
            fontFamily: "Outfit, sans-serif",
          },
        }}
        richColors
      />
    </QueryClientProvider>
  );
}
