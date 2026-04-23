import type { ReactNode } from 'react'
import { create } from 'zustand'

type AlertType = 'success' | 'error' | 'warning' | 'info'

type ModalOptions = {
  showOverlay?: boolean
  closeOnOverlayClick?: boolean
  overlayClassName?: string
  contentClassName?: string
}

interface UtilityStateProps {
  isMenuOpen: boolean
  isModalOpen: boolean
  modalContent: ReactNode | null
  modalOptions: ModalOptions
  alert: {
    label: string
    type: AlertType
  }
  modalBackground: boolean,

  toggleMenu: () => void
  closeMenu: () => void
  openModal: (content: ReactNode, options?: ModalOptions) => void
  toggleModal: () => void
  closeModal: () => void

  setAlert: (alert: { label: string; type: AlertType }) => void
  setModalBackground: (background: boolean) => void
}

export const useUtilityStore = create<UtilityStateProps>((set) => ({
  isMenuOpen: false,
  isModalOpen: false,
  modalContent: null,
  modalOptions: {
    showOverlay: true,
    closeOnOverlayClick: true,
    overlayClassName: '',
    contentClassName: '',
  },
  alert: {
    label: '',
    type: 'info',
  },
  cartButtonHover: false,
  categoryButtonHover: false,
  modalBackground: false,
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  
  openModal: (content, options = {}) =>
    set({
      isModalOpen: true,
      modalContent: content,
      modalOptions: {
        showOverlay: true,
        closeOnOverlayClick: true,
        overlayClassName: '',
        contentClassName: '',
        ...options,
      },
    }),
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  closeModal: () =>
    set({
      isModalOpen: false,
      modalContent: null,
      modalOptions: {
        showOverlay: true,
        closeOnOverlayClick: true,
        overlayClassName: '',
        contentClassName: '',
      },
    }),

  setAlert: (alert) => set({ alert }),  
  setModalBackground: (background: boolean) => set({ modalBackground: background }),
}))
