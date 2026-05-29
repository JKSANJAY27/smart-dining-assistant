"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Global singleton socket instance to prevent HMR and hydration reconnect loops
let globalSocket: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!globalSocket) {
      console.log("🔌 Initializing global WebSocket singleton connection...");
      globalSocket = io({
        path: "/api/socket/io",
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000, // Increase delay slightly for stability
      });

      globalSocket.on("connect", () => {
        console.log("🔌 Connected to WebSocket server:", globalSocket?.id);
      });

      globalSocket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error.message);
      });

      globalSocket.on("disconnect", (reason) => {
        console.warn("🔌 Disconnected from WebSocket server:", reason);
      });
    }

    socketRef.current = globalSocket;

    // We do NOT disconnect the global singleton socket on unmount,
    // so it stays alive and synced across HMR refreshes and page re-renders!
  }, []);

  return socketRef;
}
