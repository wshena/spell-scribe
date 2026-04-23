'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalContainerProps {
  children?: React.ReactNode
  isOpen: boolean
  showOverlay?: boolean
  closeOnOverlayClick?: boolean
  onClose: () => void
  overlayClassName?: string
  contentClassName?: string
}

const ModalContainer = ({
  children,
  isOpen,
  showOverlay = true,
  closeOnOverlayClick = true,
  onClose,
  overlayClassName,
  contentClassName,
}: ModalContainerProps) => {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !children) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {showOverlay && (
        <div
          aria-hidden="true"
          className={cn('absolute inset-0 bg-black/50', overlayClassName)}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
      )}

      <div className={cn('relative z-101 max-h-[calc(100vh-2rem)] max-w-full', contentClassName)}>
        {children}
      </div>
    </div>
  )
}

export default ModalContainer
