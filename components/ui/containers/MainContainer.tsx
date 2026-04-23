'use client'

import React from 'react'
import ModalContainer from './ModalContainer'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import Alert from '../feedback/Alert'
import RouteLoadingBar from '../feedback/RouteLoadingBar'
interface MainContainerProps {
  children: React.ReactNode
}

const MainContainer = ({ children }: MainContainerProps) => {
  const alert = useUtilityStore(state => state.alert)  
  const isModalOpen = useUtilityStore(state => state.isModalOpen)
  const modalContent = useUtilityStore(state => state.modalContent)
  const modalOptions = useUtilityStore(state => state.modalOptions)
  const closeModal = useUtilityStore(state => state.closeModal)

  return (
    <div className="relative min-h-screen w-full">
      {/* loading bar */}
      <RouteLoadingBar />

      {/* Alert — tampil di semua halaman */}
      {alert.label && (
        <Alert
          label={alert.label}
          type={alert.type}
        />
      )}
      
      {/* modal */}
      <ModalContainer
        isOpen={isModalOpen}
        onClose={closeModal}
        showOverlay={modalOptions.showOverlay}
        closeOnOverlayClick={modalOptions.closeOnOverlayClick}
        overlayClassName={modalOptions.overlayClassName}
        contentClassName={modalOptions.contentClassName}
      >
        {modalContent}
      </ModalContainer>
      
      {/* Page Content */}
      {children}
    </div>
  )
}

export default MainContainer
