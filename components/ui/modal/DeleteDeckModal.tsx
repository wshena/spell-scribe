'use client'

import ModalContainer from "../containers/ModalContainer"

interface DeleteDeckModalProps {
  isOpen: boolean
  deckName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteDeckModal({
  isOpen,
  deckName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteDeckModalProps) {
  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onCancel}
      closeOnOverlayClick={!isDeleting}
    >
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/60 p-6 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Delete Deck</h2>
          <p className="text-sm text-slate-400">This action cannot be undone.</p>
        </div>

        {/* Body */}
        <p className="text-sm text-slate-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">&ldquo;{deckName}&rdquo;</span>?
          All cards and history associated with this deck will be permanently removed.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            disabled={isDeleting}
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </>
            ) : (
              'Delete Deck'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  )
}