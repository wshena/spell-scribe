import Link from 'next/link'
import { MdChevronRight } from 'react-icons/md'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string       // ← kalau tidak ada href, dianggap item aktif (tidak bisa diklik)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className={cn('flex items-center flex-wrap gap-1 text-sm', className)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separator — tidak ditampilkan di item pertama */}
              {index > 0 && (
                <MdChevronRight className="text-gray-400" size={18} />
              )}

              {/* Item aktif (terakhir) — tidak bisa diklik */}
              {isLast || !item.href ? (
                <span className={cn(
                  'text-gray-500',
                  isLast && 'text-gray-800 font-medium'
                )}>
                  {item.label}
                </span>
              ) : (
                // Item biasa — bisa diklik
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-green-600 hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb