"use client";

import { useState, useRef, type MouseEvent, useEffect } from "react";
import Image from "next/image";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import { CardProps } from "@/lib/scryfall/cards";
import { BagAddIcon, FlipIcon, PlusIcon } from "@/components/icons/Icons";
import { fetchCardRulings, RulingResponse } from "@/lib/scryfall/rulings";
import {
  getManaSymbolMap,
  getManaCostSymbolsFromMap,
  tokenizeManaText,
  ManaSymbolInfo,
} from "@/lib/scryfall/manaSymbols";
import AddCardToDeckModal from "./AddCardToDeckModal";

const legalityLabels: Record<string, string> = {
  standard: "Standard",
  future: "Future",
  historic: "Historic",
  timeless: "Timeless",
  gladiator: "Gladiator",
  pioneer: "Pioneer",
  modern: "Modern",
  legacy: "Legacy",
  pauper: "Pauper",
  vintage: "Vintage",
  penny: "Penny",
  commander: "Commander",
  oathbreaker: "Oathbreaker",
  standardbrawl: "Standard Brawl",
  brawl: "Brawl",
  alchemy: "Alchemy",
  paupercommander: "Pauper Commander",
  duel: "Duel",
  oldschool: "Old School",
  premodern: "Premodern",
  predh: "PreDH",
  tlr: "TLR",
};

const legalityStyles: Record<string, { icon: string; className: string }> = {
  legal: {
    icon: "L",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  not_legal: {
    icon: "N",
    className: "border-slate-600 bg-slate-800/70 text-slate-400",
  },
  banned: {
    icon: "B",
    className: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  restricted: {
    icon: "R",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
};

const CardDetailModal = ({ card }: { card: CardProps }) => {
  const closeModal = useUtilityStore((state) => state.closeModal);
  const openModal = useUtilityStore((state) => state.openModal);

  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const [manaSymbolMap, setManaSymbolMap] = useState<Map<string, string>>(
    new Map(),
  );

  const cardFace = card.card_faces?.[0];
  const manaCost = cardFace?.mana_cost || card.mana_cost;
  const oracleText = cardFace?.oracle_text || card.oracle_text;
  const flavorText = card?.flavor_text || "";
  const artist = cardFace?.artist || card.artist;
  const powerToughness =
    cardFace?.power !== undefined && cardFace?.toughness !== undefined
      ? `${cardFace?.power}/${cardFace?.toughness}`
      : card.power !== undefined && card.toughness !== undefined
        ? `${card.power}/${card.toughness}`
        : "";

  const getManaSymbolsForCost = (cost?: string): ManaSymbolInfo[] => {
    return getManaCostSymbolsFromMap(cost ?? "", manaSymbolMap);
  };

  const renderOracleText = (text?: string) => {
    if (!text) return <>-</>;

    const tokens = tokenizeManaText(text, manaSymbolMap);
    return tokens.map((token, idx) =>
      token.type === "symbol" ? (
        <span
          key={`oracle-${idx}`}
          className="inline-flex h-5 w-5 items-center justify-center align-text-bottom"
          title={token.symbol}
        >
          <Image
            src={token.svgUri ?? ""}
            alt={token.symbol ?? token.text}
            width={18}
            height={18}
            className="object-contain"
          />
        </span>
      ) : (
        <span key={`oracle-${idx}`}>{token.text}</span>
      ),
    );
  };

  useEffect(() => {
    const fetchSymbolMap = async () => {
      try {
        const map = await getManaSymbolMap();
        setManaSymbolMap(map);
      } catch (error) {
        console.error("Error fetching mana symbol map:", error);
      }
    };

    fetchSymbolMap();
  }, []);

  const singleManaSymbols = getManaSymbolsForCost(manaCost);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((event.clientX - centerX) / rect.width) * 14;
    const rotateX = ((centerY - event.clientY) / rect.height) * 14;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const legalityEntries = Object.entries(card.legalities);

  const [cardRulings, setCardRulings] = useState<RulingResponse | null>(null);
  const [rulingsLoading, setRulingsLoading] = useState(true);

  useEffect(() => {
    const fetchRulings = async () => {
      try {
        setRulingsLoading(true);
        const rulings = await fetchCardRulings(card.id);
        setCardRulings(rulings);
      } catch (error) {
        console.error("Error fetching card rulings:", error);
      } finally {
        setRulingsLoading(false);
      }
    };

    fetchRulings();
  }, [card.id]);

  const hasValidCardFaces =
    card.card_faces &&
    card.card_faces.length > 0 &&
    card.card_faces.every((face) => face.image_uris?.normal);

  const frontImageUri = hasValidCardFaces
    ? card.card_faces![0].image_uris?.normal
    : card.image_uris?.normal;

  const backImageUri = hasValidCardFaces
    ? card.card_faces![1]?.image_uris?.normal
    : undefined;

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [frontError, setFrontError] = useState(false);
  const [backError, setBackError] = useState(false);
  const [frontRetry, setFrontRetry] = useState(0);
  const [backRetry, setBackRetry] = useState(0);

  const handleFlip = () => {
    if (!hasValidCardFaces || card.card_faces!.length < 2 || isAnimating)
      return;
    setIsAnimating(true);
    setIsFlipped((prev) => !prev);
    // Match duration to CSS transition (600ms)
    setTimeout(() => setIsAnimating(false), 600);
  };

  const tiltStyle = {
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: "transform 0.1s ease-out",
  };

  return (
    <div className="w-[min(100vw,52rem)] max-h-[95vh] rounded-lg border border-white/10 bg-[#10161f] p-6 text-white shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
      {/* header */}
      <div className="mb-5 flex items-center justify-end">
        <button
          onClick={closeModal}
          className="cursor-pointer rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Close
        </button>
      </div>

      <div
        className="relative h-[90%] flex flex-col gap-5 md:flex-row items-center md:items-start md:gap-3 overflow-y-auto
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-none
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {/* card image */}
        <div className="sticky top-0 space-y-6 w-full md:w-[40%] h-fit">
          <div className="md:sticky top-0 space-y-6">
            <div
              ref={imageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative overflow-hidden"
              style={{ perspective: 1200 }}
            >
              {/* Flip wrapper — handles the card flip animation */}
              <div
                style={{
                  cursor: "pointer",
                  position: "relative",
                  width: "100%",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
                  transform: isFlipped
                    ? `rotateY(180deg) rotateX(${rotation.x}deg)`
                    : `rotateY(0deg) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
              >
                {/* Front face */}
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {frontError ? (
                    <div className="w-full aspect-200/280 bg-gray-700 rounded-md flex flex-col items-center justify-center text-white gap-2">
                      <span className="text-sm">Image Error</span>
                      <button
                        onClick={() => {
                          setFrontError(false);
                          setFrontRetry(0);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer w-full block"
                      style={tiltStyle}
                    >
                      <Image
                        loading="lazy"
                        src={
                          frontRetry > 0
                            ? `${frontImageUri}?retry=${frontRetry}`
                            : frontImageUri || ""
                        }
                        alt={
                          hasValidCardFaces
                            ? card.card_faces![0].name
                            : card.name
                        }
                        width={200}
                        height={280}
                        onError={() => {
                          if (frontRetry < 5) setFrontRetry((p) => p + 1);
                          else setFrontError(true);
                        }}
                        className="rounded-md w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Back face — only rendered if dual-faced */}
                {hasValidCardFaces && backImageUri && (
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
                      <div className="w-full aspect-200/280 bg-gray-700 rounded-md flex flex-col items-center justify-center text-white gap-2">
                        <span className="text-sm">Image Error</span>
                        <button
                          onClick={() => {
                            setBackError(false);
                            setBackRetry(0);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div className="cursor-pointer w-full block">
                        <Image
                          loading="lazy"
                          src={
                            backRetry > 0
                              ? `${backImageUri}?retry=${backRetry}`
                              : backImageUri
                          }
                          alt={card.card_faces![1].name}
                          width={200}
                          height={280}
                          onError={() => {
                            if (backRetry < 5) setBackRetry((p) => p + 1);
                            else setBackError(true);
                          }}
                          className="rounded-md w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Flip button */}
              {hasValidCardFaces && card.card_faces!.length > 1 && (
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={handleFlip}
                    disabled={isAnimating}
                    className={`cursor-pointer px-2 py-1 bg-violet-600 rounded-full hover:bg-violet-700 transition-all duration-300 ${
                      isAnimating ? "scale-90 opacity-70" : "hover:scale-110"
                    }`}
                  >
                    <FlipIcon size={15} color="white" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* add to wishlist */}
              <button className="text-xs cursor-pointer border border-violet-500 bg-violet-600/20 hover:bg-violet-700 text-white py-1 px-4 rounded-sm flex items-center gap-2">
                <BagAddIcon size={15} style="text-violet-300" />
                Add to Wishlist
              </button>

              {/* add to deck */}
              <button
                onClick={() => {
                  openModal(<AddCardToDeckModal card={card} />);
                }}
                className="text-xs cursor-pointer border border-violet-500 bg-violet-600/20 hover:bg-violet-700 text-white py-1 px-4 rounded-sm flex items-center gap-2"
              >
                <PlusIcon size={15} style="text-violet-300" />
                Add to Deck
              </button>
            </div>
          </div>
        </div>

        {/* card details */}
        <div className="w-full md:w-[60%] space-y-5 pr-1">
          {/* name & mana cost */}
          {card.card_faces?.length ? (
            <>
              {card.card_faces.map((face) => {
                const faceManaSymbols = getManaSymbolsForCost(face.mana_cost);
                return (
                  <div key={face.name} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="mt-3 text-2xl lg:text-3xl font-semibold text-violet-500">
                            {face.name}
                          </h2>
                          <p className="mt-1 text-sm text-slate-400">
                            {face.type_line}
                          </p>
                        </div>

                        {/* mana cost symbols */}
                        {faceManaSymbols.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-start justify-end max-w-37.5">
                            {faceManaSymbols.map((symbolInfo, idx: number) => (
                              <div
                                key={`${symbolInfo.symbol}-${symbolInfo.svgUri}-${idx}`}
                                className="flex items-center justify-center w-6 h-6"
                                title={symbolInfo.symbol}
                              >
                                <Image
                                  src={symbolInfo.svgUri}
                                  alt={symbolInfo.symbol}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        #{card.collector_number},{" "}
                        {card.rarity.charAt(0).toUpperCase() +
                          card.rarity.slice(1)}
                        , {card.border_color}
                      </p>
                    </div>

                    {/* oracle text */}
                    <div className="space-y-2">
                      <p className="text-sm md:text-md whitespace-pre-line leading-6 text-slate-100">
                        {renderOracleText(face.oracle_text)}
                      </p>
                      {flavorText ? (
                        <p className="text-sm italic text-slate-400">
                          {flavorText}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="mt-3 text-2xl lg:text-3xl font-semibold text-violet-500">
                      {card.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {card.type_line}
                    </p>
                  </div>
                  {/* mana cost symbols */}
                  {singleManaSymbols.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-start justify-end max-w-37.5">
                      {singleManaSymbols.map((symbolInfo, idx) => (
                        <div
                          key={`${symbolInfo.symbol}-${symbolInfo.svgUri}-${idx}`}
                          className="flex items-center justify-center w-6 h-6"
                          title={symbolInfo.symbol}
                        >
                          <Image
                            src={symbolInfo.svgUri}
                            alt={symbolInfo.symbol}
                            width={24}
                            height={24}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  #{card.collector_number},{" "}
                  {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)},{" "}
                  {card.border_color}
                </p>
              </div>

              {/* oracle text */}
              <div className="space-y-2">
                <p className="text-sm md:text-md whitespace-pre-line leading-6 text-slate-100">
                  {renderOracleText(oracleText)}
                </p>
                {flavorText ? (
                  <p className="text-sm italic text-slate-400">{flavorText}</p>
                ) : null}
              </div>
            </div>
          )}

          {/* card set info */}
          <div className="text-sm md:text-md text-gray-400 flex flex-col items-start">
            <span>
              <strong className="text-white">{card?.set_name}</strong> (
              {card?.set.toUpperCase()})
            </span>
            <span>
              #{card?.collector_number},{" "}
              {card?.rarity.charAt(0).toUpperCase() + card?.rarity.slice(1)},{" "}
              {card?.border_color}
            </span>
          </div>

          <div className="space-y-1">
            {/* cmc & release date */}
            <div className="grid gap-0 md:grid-cols-2">
              <div className="flex items-center gap-1">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  CMC:
                </p>
                <p className="text-sm font-medium text-white">{card.cmc}</p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Released:
                </p>
                <p className="text-sm font-medium text-white">
                  {card.released_at}
                </p>
              </div>
            </div>

            {/* artist & power/toughness */}
            <div className="grid gap-0 md:grid-cols-2">
              <div className="flex items-center gap-1">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Artist:
                </p>
                <p className="text-sm font-medium text-white">
                  {artist || "-"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Power / Toughness:
                </p>
                <p className="text-sm font-medium text-white">
                  {powerToughness || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* legalities */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Legalities</h2>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {legalityEntries.map(([format, status]) => {
                const statusStyle =
                  legalityStyles[status] || legalityStyles.not_legal;

                return (
                  <div
                    key={format}
                    className={`flex items-center justify-between gap-2 border px-3 py-2 text-xs ${statusStyle.className}`}
                  >
                    <span className="truncate font-medium text-slate-100">
                      {legalityLabels[format] || format}
                    </span>
                    <span
                      title={status.replace("_", " ")}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold uppercase"
                    >
                      {statusStyle.icon}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* card rulings */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Rulings</h2>
            {rulingsLoading ? (
              <p className="text-sm text-slate-400 italic">
                Loading rulings...
              </p>
            ) : cardRulings?.data?.length ? (
              <ul className="space-y-2">
                {cardRulings.data.map((ruling) => (
                  <li
                    key={`${ruling.object} - ${ruling.published_at} - ${ruling.comment}`}
                    className="text-sm text-slate-300 flex flex-col gap-1"
                  >
                    <span className="text-xs text-slate-500">
                      {ruling.published_at}
                    </span>
                    <span>{ruling.comment}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300">No rulings available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
