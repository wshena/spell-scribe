'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md'

const alertIcons: Record<AlertType, React.ReactNode> = {
  success: <MdCheckCircle size={20} color='#10b981' />,
  error:   <MdError       size={20} color='#ef4444' />,
  warning: <MdWarning     size={20} color='#f59e0b' />,
  info:    <MdInfo        size={20} color='#a855f7' />,
}

type AlertType = 'success' | 'error' | 'warning' | 'info'

const alertStyles: Record<AlertType, string> = {
  success: 'bg-green-50 text-green-800 border border-green-300',
  error:   'bg-red-50 text-red-800 border border-red-300',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-300',
  info:    'bg-purple-50 text-purple-800 border border-purple-300',
}

interface AlertProps {
  label: string
  type: AlertType
  duration?: number
}

const Alert = ({ label, type, duration = 5000 }: AlertProps) => {
  const setAlert = useUtilityStore(state => state.setAlert)

  // ← auto hide setelah `duration` ms
  useEffect(() => {
    if (!label) return

    const timer = setTimeout(() => {
      setAlert({ label: '', type: 'info' })
    }, duration)

    return () => clearTimeout(timer)   // ← cleanup jika label berubah sebelum timer selesai
  }, [label, duration, setAlert])


  if (!label) return null    // ← tidak render jika label kosong

  return (
    <div className="fixed w-full flex justify-center top-12.5 left-0 z-80 px-4">
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-md w-fit',
        alertStyles[type]
      )}>
        {/* Icon */}
        <span>{alertIcons[type]}</span>

        {/* Label */}
        <span className="font-medium text-sm">{label}</span>
      </div>
    </div>
  )
}

export default Alert
