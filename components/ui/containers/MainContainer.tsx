'use client'

import React from 'react'
interface MainContainerProps {
  children: React.ReactNode
}

const MainContainer = ({ children }: MainContainerProps) => {

  return (
    <div className="relative min-h-screen w-full">
      {/* Page Content */}
      {children}
    </div>
  )
}

export default MainContainer
