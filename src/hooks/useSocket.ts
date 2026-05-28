"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.io server on the same hostname/port
    const socket = io({
      path: "/api/socket/io",
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to WebSocket server:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔌 Disconnected from WebSocket server:", reason);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
