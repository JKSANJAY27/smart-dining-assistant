"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import type { MenuItem } from "@prisma/client";

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  metadata?: {
    onboardingCompleted?: boolean;
    recommendedItems?: MenuItem[];
    intent?: string;
  };
}

export function useAIChat() {
  const { sessionId } = useCartStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Abort controller reference to cancel in-flight streams if needed
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history
  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/${sessionId}/ai/history`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role as "USER" | "ASSISTANT",
          content: m.content,
          metadata: m.metadata ? (typeof m.metadata === "string" ? JSON.parse(m.metadata) : m.metadata) : {},
        }));
        
        setMessages(formatted);
      }
    } catch (e) {
      console.error("❌ Failed to fetch conversation history:", e);
    }
  }, [sessionId]);

  // Initial welcome greeting trigger
  const triggerInitialGreeting = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/session/${sessionId}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([
          {
            id: `init-${Date.now()}`,
            role: "ASSISTANT",
            content: data.speech,
            metadata: {
              onboardingCompleted: data.onboardingCompleted,
              recommendedItems: data.recommendedItems,
              intent: data.intent,
            },
          },
        ]);
      }
    } catch (e) {
      console.error("❌ Failed to trigger initial welcome:", e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Send a user message and stream back Zara's somatic response
  const sendMessage = async (text: string) => {
    if (!text.trim() || !sessionId || isLoading || isStreaming) return;

    // Create unique IDs
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // Add user message immediately
    const userMsg: ChatMessage = { id: userMsgId, role: "USER", content: text };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    setIsStreaming(true);

    // Setup abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/session/${sessionId}/ai/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("API streaming request failed");
      }

      // Add typing assistant message placeholder
      const assistantPlaceholder: ChatMessage = {
        id: assistantMsgId,
        role: "ASSISTANT",
        content: "",
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("ReadableStream is not supported");

      let accumulatedContent = "";
      let accumulatedMetadata: any = {};
      let buffer = "";

      setIsLoading(false); // Gemini responded, now streaming

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode binary chunks
        buffer += decoder.decode(value, { stream: true });
        
        // Split by SSE double-newline
        const lines = buffer.split("\n\n");
        // Keep the last partial item in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);

            // Handle word chunks
            if (parsed.text) {
              accumulatedContent += parsed.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            }
            
            // Handle final metadata additions
            if (parsed.metadata) {
              accumulatedMetadata = parsed.metadata;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, metadata: accumulatedMetadata }
                    : msg
                )
              );
            }
          } catch (jsonErr) {
            console.warn("⚠️ JSON parse error on chunk stream:", jsonErr);
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("📡 Stream aborted by client");
      } else {
        console.error("❌ Error during SSE stream connection:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "ASSISTANT",
            content: "My apologies, but our kitchen connection timed out. What would you like to explore next?",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchHistory().then(() => {
        // If there are no messages, trigger initial welcome
        setMessages((current) => {
          if (current.length === 0) {
            triggerInitialGreeting();
          }
          return current;
        });
      });
    }
  }, [sessionId, fetchHistory, triggerInitialGreeting]);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    cancelStream,
    refreshHistory: fetchHistory,
  };
}
