'use client'
import { CardProps } from "@/lib/scryfall/cards"
import { useState } from "react"
import { FlipIcon } from "../icons/Icons"
import Image from "next/image"

const Card = ({ data }: { data: CardProps }) => {
  // Check if card_faces exist and all have valid image_uris
  const hasValidCardFaces = data.card_faces && data.card_faces.length > 0 && 
    data.card_faces.every(face => face.image_uris?.normal)
  
  const [currentFace, setCurrentFace] = useState(0)
  
  const currentImageUri = hasValidCardFaces
    ? data.card_faces![currentFace].image_uris?.normal
    : data.image_uris?.normal
  
  const [imageSrc, setImageSrc] = useState(currentImageUri || '')
  const [retryCount, setRetryCount] = useState(0)
  const [showPlaceholder, setShowPlaceholder] = useState(!currentImageUri)

  const handleImageError = () => {
    if (retryCount < 5) {
      setRetryCount(prev => prev + 1)
      // Refresh image by re-setting src
      setImageSrc(`${currentImageUri}?retry=${retryCount + 1}`)
    } else {
      setShowPlaceholder(true)
    }
  }

  const handleRetry = () => {
    setRetryCount(0)
    setImageSrc(currentImageUri || '')
    setShowPlaceholder(false)
  }

  const handleFlip = () => {
    if (hasValidCardFaces && data.card_faces!.length > 1) {
      const nextFace = (currentFace + 1) % data.card_faces!.length
      setCurrentFace(nextFace)
      const nextImageUri = data.card_faces![nextFace].image_uris?.normal
      setImageSrc(nextImageUri || '')
      setShowPlaceholder(!nextImageUri)
      setRetryCount(0) // Reset retry for new face
    }
  }

  if (showPlaceholder) {
    return (
      <div className="w-full relative">
        <div className="w-full aspect-200/280 bg-gray-700 rounded-md flex flex-col items-center justify-center text-white gap-2">
          <span className="text-sm">Image Error</span>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
        {hasValidCardFaces && data.card_faces!.length > 1 && (
          <div className="absolute top-2 right-2 flex items-center justify-end">
            <button
              onClick={handleFlip}
              className="cursor-pointer px-2 py-1 bg-violet-600 rounded-full"
            >
              <FlipIcon size={15} color='white' />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <button className="w-full">
        <Image
          loading="lazy"
          src={imageSrc}
          alt={hasValidCardFaces ? data.card_faces![currentFace].name : data.name}
          width={200}
          height={280}
          onError={handleImageError}
          className="rounded-md w-full h-auto"
        />

      </button>

      {/* Flip Button */}
      {hasValidCardFaces && data.card_faces!.length > 1 && (
        <div className="absolute top-2 right-2 flex items-center justify-end">
          <button
            onClick={handleFlip}
            className="cursor-pointer px-2 py-1 bg-violet-600 rounded-full hover:bg-violet-700"
          >
            <FlipIcon size={15} color='white' />
          </button>
        </div>
      )}
    </div>
  )
}

export default Card