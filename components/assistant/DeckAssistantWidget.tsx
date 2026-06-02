"use client";

import { FormEvent, useEffect, useRef } from "react";
import {
  FaArrowUp,
  FaChartBar,
  FaCut,
  FaMagic,
  FaPaperPlane,
  FaProjectDiagram,
  FaRobot,
  FaStop,
  FaTachometerAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useAssistant } from "@/hooks/useAssistant";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    label: "Analyze Deck",
    icon: FaChartBar,
    prompt:
      "Analyze deck ini. Jelaskan game plan, kekuatan utama, kelemahan, curve, ramp, draw, removal, win condition, dan hal yang paling perlu diperbaiki.",
  },
  {
    label: "Suggest Cuts",
    icon: FaCut,
    prompt:
      "Suggest cuts untuk deck ini. Beri daftar kartu yang paling layak dipotong, alasan singkat, dan prioritas cut.",
  },
  {
    label: "Suggest Upgrades",
    icon: FaArrowUp,
    prompt:
      "Suggest upgrades untuk deck ini. Kelompokkan menjadi ramp, draw, removal, protection, win condition, dan synergy pieces.",
  },
  {
    label: "Generate Commander Deck",
    icon: FaMagic,
    prompt:
      "Buatkan starting Commander deck list berdasarkan commander/tema deck ini. Susun per kategori dan jelaskan rencana bermainnya.",
  },
  {
    label: "Explain Combo Lines",
    icon: FaProjectDiagram,
    prompt:
      "Cari dan jelaskan combo lines atau synergy lines yang mungkin ada di deck ini. Tulis langkah combo dan kartu pendukungnya.",
  },
  {
    label: "Estimate Power Level",
    icon: FaTachometerAlt,
    prompt:
      "Estimate power level EDH deck ini dari 1 sampai 10. Beri alasan, asumsi, dan perubahan yang bisa menaikkan/menurunkan power level.",
  },
];

export default function DeckAssistantWidget() {
  const {
    messages,
    input,
    setInput,
    isStreaming,
    isOpen,
    setIsOpen,
    sendMessage,
    stopStreaming,
    clearMessages,
  } = useAssistant();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-70 inline-flex h-12 items-center gap-2 rounded-lg border border-violet-300/30 bg-violet-600 px-4 text-sm font-semibold text-white shadow-xl shadow-black/40 transition hover:bg-violet-500 cursor-pointer",
          isOpen && "hidden",
        )}
        aria-label="Open deck assistant"
      >
        <FaRobot aria-hidden="true" />
        Assistant
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-70 flex items-end justify-end bg-black/45 p-3 sm:p-5">
          <section className="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b1118] text-white shadow-2xl shadow-black/70">
            <header className="flex items-center justify-between border-b border-white/10 bg-[#10161f] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-600">
                  <FaRobot aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Deck Assistant</h2>
                  <p className="text-xs text-slate-400">SpellScribe MTG AI</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearMessages}
                  className="cursor-pointer grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-violet-300/40 hover:text-white"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <FaTrash size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-violet-300/40 hover:text-white"
                  aria-label="Close assistant"
                  title="Close"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="border-b border-white/10 px-3 py-3">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      disabled={isStreaming}
                      onClick={() => void sendMessage(action.prompt)}
                      className="cursor-pointer flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:border-violet-300/40 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Icon
                        className="shrink-0 text-violet-300"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 leading-4">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-slate-800
        [&::-webkit-scrollbar-thumb]:bg-slate-600
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-slate-500"
            >
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const text = message.parts.map((part) => part.text).join("\n");
                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "flex",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-md px-3 py-2 text-sm leading-6",
                        isUser
                          ? "bg-violet-600 text-white"
                          : "border border-white/10 bg-slate-900 text-slate-100",
                      )}
                    >
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-white/10 bg-[#10161f] p-3"
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Tanya tentang deck ini..."
                rows={2}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="cursor-pointer grid h-11 w-11 place-items-center rounded-lg bg-slate-700 text-white transition hover:bg-slate-600"
                  aria-label="Stop response"
                  title="Stop"
                >
                  <FaStop aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="cursor-pointer grid h-11 w-11 place-items-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  aria-label="Send message"
                  title="Send"
                >
                  <FaPaperPlane aria-hidden="true" />
                </button>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
