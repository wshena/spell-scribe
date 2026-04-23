import { useState, useRef, useEffect } from 'react'
import ExploreDropdownItem from './ExploreDropdownItem'

const exploreLinks = [
  { 
    name: "Decks", 
    href: '/decks',
    description: "Explore popular decks", 
  },
  { 
    name: "Cards", 
    href: '/cards',
    description: "Explore popular cards", 
  },
]

export default function ExploreDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const handleMouseLeave = () => setIsOpen(false)

  return (
    <div ref={dropdownRef} className="relative" onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors duration-200 cursor-pointer"
      >
        Explore
        <span className={isOpen ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'}>▼</span>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.2rem)] w-[min(72vw,22rem)] rounded-xl shadow-2xl border border-white/10 bg-[#161b24] z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {exploreLinks.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {exploreLinks.map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <ExploreDropdownItem {...item} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-center text-sm text-slate-400">No items available</div>
          )}
        </div>
      )}
    </div>
  )
}
