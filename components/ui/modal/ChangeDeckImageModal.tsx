"use client";

import Image from "next/image";
import { useState } from "react";
import ModalContainer from "@/components/ui/containers/ModalContainer";
import { DeckCard, getDeckCardImageUri } from "@/components/cards/CardOnDeck";
import { CancelIcon } from "@/components/icons/Icons";

interface ChangeDeckImageModalProps {
  isOpen: boolean;
  cards: DeckCard[];
  currentCoverCard: DeckCard | null;
  onSave: (card: DeckCard) => void;
  onClose: () => void;
}

export default function ChangeDeckImageModal({
  isOpen,
  cards,
  currentCoverCard,
  onSave,
  onClose,
}: ChangeDeckImageModalProps) {
  const [selectedCard, setSelectedCard] = useState<DeckCard | null>(
    currentCoverCard ?? cards[0] ?? null,
  );

  const previewImage = selectedCard ? selectedCard.image_uris?.art_crop : null;

  const handleSave = () => {
    if (!selectedCard) return;
    onSave(selectedCard);
    onClose();
  };

  // Deduplicate by card_id for the select options
  const uniqueCards = cards.filter(
    (card, index, self) =>
      index === self.findIndex((c) => c.card_id === card.card_id),
  );

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="w-[min(100vw,28rem)] rounded-xl border border-white/10 bg-[#1a1f2e] text-white shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold">Change Main Image</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <CancelIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Image Preview */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">
              Image Preview
            </p>
            <div className="w-full aspect-4/3 rounded-lg overflow-hidden bg-slate-800">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={selectedCard?.card_name ?? "Card preview"}
                  width={448}
                  height={336}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Card selector */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">
              Selected Card
            </p>
            <select
              value={selectedCard?.card_id ?? ""}
              onChange={(e) => {
                const found = uniqueCards.find(
                  (c) => c.card_id === e.target.value,
                );
                if (found) setSelectedCard(found);
              }}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              {uniqueCards.map((card) => (
                <option key={card.card_id} value={card.card_id}>
                  {card.card_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedCard}
            className="cursor-pointer px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
