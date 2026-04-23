'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MdExpandMore } from 'react-icons/md'
import { AngleRightIcon, CardsIcon, StackIcon } from '../icons/Icons'

const exploreLinks = [
  { 
    name: "Decks", 
    href: '/decks',
    description: "Explore popular decks", 
    icon: <StackIcon size={25} color="#a855f7" /> 
  },
  { 
    name: "Cards", 
    href: '/cards',
    description: "Explore popular cards", 
    icon: <CardsIcon size={30} color="#a855f7" /> 
  },
]

const ExploreDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown ketika user klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown ketika user hover keluar dari dropdown
  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-1',
          'text-sm font-medium text-text-secondary hover:text-primary',
          'transition-colors duration-200',
          isOpen && 'text-primary',
          'cursor-pointer',
        )}
      >
        Explore
        <MdExpandMore
          size={18}
          className={cn(
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 min-w-120 w-156 rounded-xl shadow-2xl',
            'bg-white dark:bg-bg-secondary',
            'py-2 z-40',
            'animate-in fade-in slide-in-from-top-2 duration-200',
            'border border-border-light dark:border-border-primary'
          )}
        >
          {exploreLinks.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2">
              {exploreLinks.map((item, index) => (
                <li key={`${item.href}-${index}`} className="w-fit">
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'group min-w-full w-75 flex items-center justify-between px-4 py-2 rounded-lg',
                      'bg-transparent text-black',
                      'hover:bg-purple-900 hover:text-white',
                      'transition-colors duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'min-w-50 max-w-full'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.name.toLowerCase() === 'decks' ? (
                        <StackIcon size={25} style='group-hover:text-white text-[#a855f7]' />
                      ) : (
                        <CardsIcon size={30} style='group-hover:text-white text-[#a855f7]' />
                      )}
                      <div className="flex-1 -space-y-2">
                        <p className="text-md font-semibold group-hover:text-white transition-colors duration-150">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 group-hover:text-white mt-1 transition-colors duration-150">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <AngleRightIcon size={20} style="text-[#a855f7] group-hover:text-white transition-colors duration-150" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-text-tertiary text-center">
              No items available
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExploreDropdown
