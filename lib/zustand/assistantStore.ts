import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AssistantMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

const OPENING_MESSAGE: AssistantMessage = {
  role: "model",
  parts: [
    {
      text: "Hai! Saya bisa bantu analisa deck, suggest cuts/upgrades, jelaskan combo lines, atau estimasi power level EDH.",
    },
  ],
};

const MAX_HISTORY = 50; // batasan agar localStorage tidak penuh

interface AssistantState {
  messages: AssistantMessage[];
  isOpen: boolean;

  // Actions
  setMessages: (messages: AssistantMessage[]) => void;
  appendMessage: (message: AssistantMessage) => void;
  updateLastMessage: (text: string) => void;
  clearMessages: () => void;
  setIsOpen: (open: boolean) => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      messages: [OPENING_MESSAGE],
      isOpen: false,

      setMessages: (messages) => set({ messages }),

      appendMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message].slice(-MAX_HISTORY),
        })),

      updateLastMessage: (text) =>
        set((state) => {
          const updated = [...state.messages];
          const last = updated[updated.length - 1];
          if (last?.role === "model") {
            updated[updated.length - 1] = {
              ...last,
              parts: [{ text: last.parts[0].text + text }],
            };
          }
          return { messages: updated };
        }),

      clearMessages: () => set({ messages: [OPENING_MESSAGE] }),

      setIsOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "spellscribe-assistant",
      // Hanya persist messages, bukan isOpen
      // supaya chat tidak auto-terbuka saat refresh
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
