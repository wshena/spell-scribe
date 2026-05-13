"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CancelIcon } from "@/components/icons/Icons";
import { CardProps } from "@/lib/scryfall/cards";
import type { DeckWithCards } from "@/lib/supabase/decks";
import { useUtilityStore } from "@/lib/zustand/utilityStore";

interface AddCardToDeckModalProps {
  card: CardProps;
}

function getCardImage(card: CardProps) {
  return card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const AddCardToDeckModal = ({ card }: AddCardToDeckModalProps) => {
  const closeModal = useUtilityStore((state) => state.closeModal);
  const setAlert = useUtilityStore((state) => state.setAlert);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [decks, setDecks] = useState<DeckWithCards[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);
  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );
  const image = getCardImage(card);

  useEffect(() => {
    const fetchUserDecks = async () => {
      try {
        setIsLoadingDecks(true);
        const response = await fetch("/api/decks");

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to load decks");
        }

        const userDecks = (await response.json()) as DeckWithCards[];
        setDecks(userDecks);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load decks"));
      } finally {
        setIsLoadingDecks(false);
      }
    };

    fetchUserDecks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToDeck = async () => {
    if (!selectedDeckId || isAdding) return;

    setIsAdding(true);
    setError("");

    try {
      const response = await fetch(`/api/decks/${selectedDeckId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_id: card.id,
          card_name: card.name,
          type_line: card.type_line,
          quantity: 1,
          section: "main",
          colors: card.colors || null,
          color_identity: card.color_identity || null,
          image_uris: card.image_uris || card.card_faces?.[0]?.image_uris || null,
          card_faces: card.card_faces || null,
          card_data: card,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to add card to deck");
      }

      setAlert({
        label: `${card.name} added to ${selectedDeck?.name || "deck"}`,
        type: "success",
      });
      closeModal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add card to deck"));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-[min(100vw,32rem)] max-h-[95vh] border border-white/10 bg-[#202020] text-white shadow-2xl shadow-black/50 overflow-visible flex flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h1 className="text-lg font-medium">Add to Deck</h1>
        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer text-slate-400 transition hover:text-white"
          aria-label="Close add to deck modal"
        >
          <CancelIcon size={22} />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="mx-auto mb-5 w-36 overflow-hidden rounded-md bg-black/40 shadow-xl shadow-black/40">
          {image ? (
            <Image
              src={image}
              alt={card.name}
              width={180}
              height={252}
              className="h-auto w-full"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-200/280 items-center justify-center text-xs text-slate-500">
              No image
            </div>
          )}
        </div>

        <p className="mb-4 text-center text-base text-white">
          Which deck do you want to add this card to?
        </p>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((current) => !current)}
            className="flex w-full cursor-pointer items-center justify-between rounded border border-black bg-[#111] px-3 py-2 text-left text-sm text-slate-300"
          >
            <span className={selectedDeck ? "text-white" : "text-slate-400"}>
              {selectedDeck?.name || "Select a deck"}
            </span>
            <span className="text-xl leading-none text-white">⌄</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 bg-[#343434] p-3 shadow-2xl shadow-black/60">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search decks"
                className="mb-4 w-full border-b border-violet-400 bg-transparent px-0 py-2 text-sm text-white outline-none placeholder:text-slate-400"
                autoFocus
              />

              <p className="mb-2 text-xs font-semibold uppercase text-violet-300">
                All Decks
              </p>

              <div className="max-h-44 overflow-y-auto">
                {isLoadingDecks ? (
                  <p className="py-2 text-sm text-slate-400">
                    Loading decks...
                  </p>
                ) : filteredDecks.length > 0 ? (
                  filteredDecks.map((deck) => (
                    <button
                      key={deck.id}
                      type="button"
                      onClick={() => {
                        setSelectedDeckId(deck.id || "");
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className="block w-full cursor-pointer px-0 py-1.5 text-left text-sm text-white transition hover:text-violet-300"
                    >
                      {deck.name}
                    </button>
                  ))
                ) : (
                  <p className="py-2 text-sm text-slate-400">No decks found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          type="button"
          onClick={handleAddToDeck}
          disabled={!selectedDeckId || isAdding || isLoadingDecks}
          className="mt-4 w-full cursor-pointer rounded bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-900 disabled:text-violet-200"
        >
          {isAdding ? "Adding..." : "Add to Deck"}
        </button>
      </div>
    </div>
  );
};

export default AddCardToDeckModal;
