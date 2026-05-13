"use client";

import { useState } from "react";
import Image from "next/image";
import { CardProps } from "@/lib/scryfall/cards";
import { FlipIcon, OptionsIcon } from "@/components/icons/Icons";

export interface DeckCard {
  id: string;
  card_id: string;
  card_name: string;
  type_line?: string | null;
  quantity: number;
  section: "main" | "sideboard" | "commander" | "maybeboard";
  colors?: string[] | null;
  color_identity?: string[] | null;
  image_uris?: CardProps["image_uris"] | null;
  card_faces?: CardProps["card_faces"] | null;
  card_data?: CardProps | null;
}

interface CardOnDeckProps {
  card: DeckCard;
  isOwner: boolean;
  isFlipped: boolean;
  isMenuOpen: boolean;
  isRemoving: boolean;
  canSetAsCommander: boolean;
  onHover: (card: DeckCard) => void;
  onFlipChange: (card: DeckCard, isFlipped: boolean) => void;
  onToggleMenu: (cardId: string) => void;
  onMenuRef: (cardId: string, element: HTMLDivElement | null) => void;
  onAddOne: (card: DeckCard) => void;
  onRemoveOne: (card: DeckCard) => void;
  onAddMore: (card: DeckCard) => void;
  onAddToWishlist: (card: DeckCard) => void;
  onAddToCollection: (card: DeckCard) => void;
  onViewDetails: (card: DeckCard) => void;
  onCopyCardName: (card: DeckCard) => void;
  onSetAsCommander: (card: DeckCard) => void;
  onSetDeckImage: (card: DeckCard) => void;
  onRemoveCard: (card: DeckCard) => void;
}

export function hasDeckCardBackFace(card: DeckCard) {
  return Boolean(
    card.card_data?.card_faces?.length &&
    card.card_data.card_faces.length > 1 &&
    card.card_data.card_faces.every((face) => face.image_uris?.normal),
  );
}

export function getDeckCardImageUri(card: DeckCard, isFlipped = false) {
  if (isFlipped && hasDeckCardBackFace(card)) {
    return card.card_data?.card_faces?.[1]?.image_uris?.normal || null;
  }

  return (
    card.image_uris?.normal ||
    card.card_data?.image_uris?.normal ||
    card.card_data?.card_faces?.[0]?.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal ||
    null
  );
}

const CardOnDeck = ({
  card,
  isOwner,
  isFlipped,
  isMenuOpen,
  isRemoving,
  canSetAsCommander,
  onHover,
  onFlipChange,
  onToggleMenu,
  onMenuRef,
  onAddOne,
  onRemoveOne,
  onAddMore,
  onAddToWishlist,
  onAddToCollection,
  onViewDetails,
  onCopyCardName,
  onSetAsCommander,
  onSetDeckImage,
  onRemoveCard,
}: CardOnDeckProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [frontError, setFrontError] = useState(false);
  const [backError, setBackError] = useState(false);
  const [frontRetry, setFrontRetry] = useState(0);
  const [backRetry, setBackRetry] = useState(0);

  const hasBackFace = hasDeckCardBackFace(card);
  const frontImageUri = getDeckCardImageUri(card) || "/image/empty-deck-bg.png";
  const backImageUri = hasBackFace
    ? card.card_data?.card_faces?.[1]?.image_uris?.normal
    : null;

  const handleFlip = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!hasBackFace || isAnimating) return;

    setIsAnimating(true);
    onFlipChange(card, !isFlipped);
    window.setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className="group relative w-fit cursor-pointer"
      onMouseEnter={() => onHover(card)}
    >
      <div
        style={{
          cursor: "pointer",
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {frontError ? (
            <div className="flex aspect-200/280 w-full flex-col items-center justify-center gap-2 rounded-md bg-gray-700 text-white">
              <span className="text-sm">Image Error</span>
              <button
                type="button"
                onClick={() => {
                  setFrontError(false);
                  setFrontRetry(0);
                }}
                className="cursor-pointer rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <Image
              loading="lazy"
              src={
                frontRetry > 0
                  ? `${frontImageUri}?retry=${frontRetry}`
                  : frontImageUri || ""
              }
              alt={card.card_data?.card_faces?.[0]?.name || card.card_name}
              width={200}
              height={280}
              onError={() => {
                if (frontRetry < 5) setFrontRetry((prev) => prev + 1);
                else setFrontError(true);
              }}
              className="h-auto w-full rounded-md"
            />
          )}
        </div>

        {hasBackFace && backImageUri && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {backError ? (
              <div className="flex aspect-200/280 w-full flex-col items-center justify-center gap-2 rounded-md bg-gray-700 text-white">
                <span className="text-sm">Image Error</span>
                <button
                  type="button"
                  onClick={() => {
                    setBackError(false);
                    setBackRetry(0);
                  }}
                  className="cursor-pointer rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <Image
                loading="lazy"
                src={
                  backRetry > 0
                    ? `${backImageUri}?retry=${backRetry}`
                    : backImageUri
                }
                alt={card.card_data?.card_faces?.[1]?.name || card.card_name}
                width={200}
                height={280}
                onError={() => {
                  if (backRetry < 5) setBackRetry((prev) => prev + 1);
                  else setBackError(true);
                }}
                className="h-auto w-full rounded-md"
              />
            )}
          </div>
        )}
      </div>

      {hasBackFace && (
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-150 ease-in-out absolute right-5 top-15 z-10">
          <button
            type="button"
            aria-label={`Flip ${card.card_name}`}
            onClick={handleFlip}
            disabled={isAnimating}
            className={`cursor-pointer rounded-full bg-violet-600 px-2 py-1 transition-all duration-300 hover:bg-violet-700 ${
              isAnimating ? "scale-90 opacity-70" : "hover:scale-110"
            }`}
          >
            <FlipIcon size={15} color="white" />
          </button>
        </div>
      )}

      <div className="absolute left-5 top-5 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
          x{card.quantity}
        </span>
      </div>

      {isOwner && (
        <div className="absolute right-5 top-5 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100">
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => onToggleMenu(card.id)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 transition hover:border-violet-500 hover:text-white"
            >
              <OptionsIcon size={16} />
            </button>

            {isMenuOpen && (
              <div
                ref={(element) => onMenuRef(card.id, element)}
                className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#10161f] p-2 shadow-2xl shadow-black/50"
              >
                <button
                  type="button"
                  onClick={() => onAddOne(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Add one
                  <span className="text-slate-500">+1</span>
                </button>
                {card.section !== "commander" && (
                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => onRemoveOne(card)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900 disabled:cursor-wait disabled:opacity-60"
                  >
                    Remove one
                    <span className="text-slate-500">-1</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAddMore(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Add more
                  <span className="text-slate-500">Custom</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddToWishlist(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Add to wishlist
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCollection(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Add to collection
                </button>
                <button
                  type="button"
                  onClick={() => onViewDetails(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  View details
                </button>
                <button
                  type="button"
                  onClick={() => onCopyCardName(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Copy name
                </button>
                {card.section !== "commander" && canSetAsCommander && (
                  <button
                    type="button"
                    onClick={() => onSetAsCommander(card)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                  >
                    Set as commander
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSetDeckImage(card)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Set as deck image
                </button>
                {card.section !== "commander" && (
                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => onRemoveCard(card)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-red-300 transition hover:bg-slate-900 disabled:cursor-wait disabled:opacity-60"
                  >
                    Remove card
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardOnDeck;
