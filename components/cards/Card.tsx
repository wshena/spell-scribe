"use client";
import { CardProps } from "@/lib/scryfall/cards";
import { useState, useRef } from "react";
import { FlipIcon } from "../icons/Icons";
import Image from "next/image";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import CardDetailModal from "../ui/modal/CardDetailModal";

const Card = ({
  data,
  onWishlistChange,
}: {
  data: CardProps;
  onWishlistChange?: () => void;
}) => {
  const openModal = useUtilityStore((state) => state.openModal);

  const handleCardClick = () => {
    openModal(
      <CardDetailModal card={data} onWishlistChange={onWishlistChange} />,
      { contentClassName: "w-full" },
    );
  };

  const hasValidCardFaces =
    data.card_faces &&
    data.card_faces.length > 0 &&
    data.card_faces.every((face) => face.image_uris?.normal);

  const frontImageUri = hasValidCardFaces
    ? data.card_faces![0].image_uris?.normal
    : data.image_uris?.normal;

  const backImageUri = hasValidCardFaces
    ? data.card_faces![1]?.image_uris?.normal
    : undefined;

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const [frontLoading, setFrontLoading] = useState(true);
  const [backLoading, setBackLoading] = useState(true);
  const [frontError, setFrontError] = useState(false);
  const [backError, setBackError] = useState(false);
  const [frontRetry, setFrontRetry] = useState(0);
  const [backRetry, setBackRetry] = useState(0);

  const handleFlip = () => {
    if (!hasValidCardFaces || data.card_faces!.length < 2 || isAnimating)
      return;
    setIsAnimating(true);
    setIsFlipped((prev) => !prev);
    // Match duration to CSS transition (600ms)
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isAnimating) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setRotation({
      x: ((centerY - e.clientY) / rect.height) * 15,
      y: ((e.clientX - centerX) / rect.width) * 15,
    });
  };

  const handleMouseLeave = () => setRotation({ x: 0, y: 0 });

  const tiltStyle = {
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: "transform 0.1s ease-out",
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flip wrapper — handles the card flip animation */}
      <div
        onClick={handleCardClick}
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
            <button
              onClick={handleCardClick}
              className="cursor-pointer w-full block relative"
              style={tiltStyle}
            >
              {frontLoading && (
                <div className="absolute inset-0 z-10">
                  <Image
                    src="/image/empty-deck-bg.png"
                    alt="Loading placeholder"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              )}

              <Image
                loading="lazy"
                src={
                  frontRetry > 0
                    ? `${frontImageUri}?retry=${frontRetry}`
                    : frontImageUri || ""
                }
                alt={hasValidCardFaces ? data.card_faces![0].name : data.name}
                width={200}
                height={280}
                onLoad={() => setFrontLoading(false)}
                onError={() => {
                  setFrontLoading(false);

                  if (frontRetry < 5) {
                    setFrontRetry((p) => p + 1);
                    setFrontLoading(true);
                  } else {
                    setFrontError(true);
                  }
                }}
                className={`rounded-md w-full h-auto transition-opacity duration-300 ${
                  frontLoading ? "opacity-0" : "opacity-100"
                }`}
              />
            </button>
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
              <button
                onClick={handleCardClick}
                className="cursor-pointer w-full block relative"
              >
                {backLoading && (
                  <div className="absolute inset-0 z-10">
                    <Image
                      src="/image/empty-deck-bg.png"
                      alt="Loading placeholder"
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                )}

                <Image
                  loading="lazy"
                  src={
                    backRetry > 0
                      ? `${backImageUri}?retry=${backRetry}`
                      : backImageUri
                  }
                  alt={data.card_faces![1].name}
                  width={200}
                  height={280}
                  onLoad={() => setBackLoading(false)}
                  onError={() => {
                    setBackLoading(false);

                    if (backRetry < 5) {
                      setBackRetry((p) => p + 1);
                      setBackLoading(true);
                    } else {
                      setBackError(true);
                    }
                  }}
                  className={`rounded-md w-full h-auto transition-opacity duration-300 ${
                    backLoading ? "opacity-0" : "opacity-100"
                  }`}
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Flip button */}
      {hasValidCardFaces && data.card_faces!.length > 1 && (
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
  );
};

export default Card;
