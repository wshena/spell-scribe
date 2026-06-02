"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useAssistantStore } from "@/lib/zustand/assistantStore";

export function useAssistant() {
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const messages = useAssistantStore((state) => state.messages);
  const appendMessage = useAssistantStore((state) => state.appendMessage);
  const updateLastMessage = useAssistantStore(
    (state) => state.updateLastMessage,
  );
  const clearMessages = useAssistantStore((state) => state.clearMessages);
  const isOpen = useAssistantStore((state) => state.isOpen);
  const setIsOpen = useAssistantStore((state) => state.setIsOpen);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage = { role: "user" as const, parts: [{ text }] };
    const placeholderModel = { role: "model" as const, parts: [{ text: "" }] };

    appendMessage(userMessage);
    appendMessage(placeholderModel);
    setInput("");
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          // Kirim semua messages kecuali placeholder terakhir
          messages: [...messages, userMessage],
          currentPath: pathname,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw Object.assign(
          new Error(errorData?.error || "Assistant request failed."),
          { status: res.status },
        );
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        updateLastMessage(chunk);
      }

      const remainingText = decoder.decode();
      if (remainingText) updateLastMessage(remainingText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        updateLastMessage("Respons dihentikan.");
        return;
      }

      const message =
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        err.status === 429
          ? "Asisten sedang sibuk, coba lagi dalam beberapa detik."
          : err instanceof Error
            ? err.message
            : "Maaf, terjadi kesalahan. Silakan coba lagi.";

      // Replace placeholder dengan pesan error
      useAssistantStore.getState().updateLastMessage(message);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    clearMessages();
    setInput("");
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return {
    messages,
    input,
    setInput,
    isStreaming,
    isOpen,
    setIsOpen,
    sendMessage,
    stopStreaming,
    clearMessages: handleClear,
  };
}
