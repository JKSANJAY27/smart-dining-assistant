import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "Smart Dining Assistant | AI-Powered Restaurant Ordering",
    template: "%s | Smart Dining Assistant",
  },
  description:
    "Experience AI-powered dining with Zara — your personal dining assistant. Browse menus, get personalized recommendations, and order effortlessly.",
  keywords: ["restaurant", "dining", "AI assistant", "food ordering", "smart menu"],
  authors: [{ name: "Smart Dining" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Smart Dining Assistant",
    description: "AI-powered restaurant ordering — guided by Zara, your dining assistant.",
    siteName: "Smart Dining Assistant",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="hero-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
