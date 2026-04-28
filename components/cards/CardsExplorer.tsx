'use client'

/* eslint-disable @next/next/no-img-element */

import type { ScryfallSet, SetFilters, SetTypeOption, SetsPageResult } from '@/lib/scryfall/sets'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import CardsSearchTipsModal from '../ui/modal/CardsSearchTipsModal'
import CardsAdvancedSearchModal from '../ui/modal/CardsAdvancedSearchModal'
import { SearchIcon } from '../icons/Icons'

interface CardsExplorerProps {
  initialItems: ScryfallSet[]
  initialHasMore: boolean
  initialTotalCount: number
  initialFilters: SetFilters
  setTypeOptions: SetTypeOption[]
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export default function CardsExplorer({
  initialItems,
  initialHasMore,
  initialTotalCount,
  initialFilters,
  setTypeOptions,
}: CardsExplorerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const openModal = useUtilityStore((state) => state.openModal)
  const [isRouting, startRouting] = useTransition()
  const [items, setItems] = useState(initialItems)
  const [page, setPage] = useState(initialFilters.page)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState('')
  const [searchInput, setSearchInput] = useState(initialFilters.q)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const setTypeLabelMap = useMemo(
    () => new Map(setTypeOptions.map((option) => [option.value, option.label])),
    [setTypeOptions]
  )

  useEffect(() => {
    setItems(initialItems)
    setPage(initialFilters.page)
    setHasMore(initialHasMore)
    setIsLoadingMore(false)
    setLoadMoreError('')
    setSearchInput(initialFilters.q)
  }, [initialFilters.page, initialFilters.q, initialHasMore, initialItems])

  const queryStringWithoutPage = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    return params.toString()
  }, [searchParams])

  const updateQueryParams = useCallback(
    (updates: Record<string, string | boolean | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        const normalizedValue = typeof value === 'boolean' ? String(value) : value?.trim()

        if (!normalizedValue || normalizedValue === 'all') {
          params.delete(key)
          return
        }

        params.set(key, normalizedValue)
      })

      params.delete('page')

      startRouting(() => {
        router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
          scroll: false,
        })
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const node = sentinelRef.current

    if (!node || !hasMore || isLoadingMore || isRouting) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (!entry?.isIntersecting) {
          return
        }

        setIsLoadingMore(true)
        setLoadMoreError('')

        const params = new URLSearchParams(queryStringWithoutPage)
        params.set('page', String(page + 1))

        fetch(`/api/sets?${params.toString()}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error('Failed to load more sets')
            }

            return (await response.json()) as SetsPageResult
          })
          .then((result) => {
            setItems((currentItems) => {
              const existingIds = new Set(currentItems.map((item) => item.id))
              const nextItems = result.items.filter((item) => !existingIds.has(item.id))
              return [...currentItems, ...nextItems]
            })
            setPage(result.page)
            setHasMore(result.hasMore)
          })
          .catch(() => {
            setLoadMoreError('Unable to load more sets right now.')
          })
          .finally(() => {
            setIsLoadingMore(false)
          })
      },
      {
        rootMargin: '320px 0px',
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, isRouting, page, queryStringWithoutPage])

  return (
    <section className="space-y-6">
      <div className="text-white">
        {/* search form */}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            updateQueryParams({ q: searchInput, setType: initialFilters.setType })
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:w-[50%] flex items-center gap-0">
              <label className="flex-1">
                <span className="sr-only">Search sets</span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search set name, code, or type"
                  className="w-full rounded-sm bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400"
                />
              </label>

              {/* search button */}
              <button
                type="submit"
                className="cursor-pointerrounded-md bg-violet-500 p-3"
              >
                <SearchIcon size={15} color='white' />
              </button>
            </div>

            <label className="lg:w-72">
              <span className="sr-only">Filter by set type</span>
              <select
                value={initialFilters.setType}
                onChange={(event) => updateQueryParams({ setType: event.target.value, q: searchInput })}
                className="cursor-pointer w-full md:w-[50%] lg:w-full rounded-sm bg-white/5 px-4 py-3 text-sm text-violet-400 outline-none focus:border-violet-400"
              >
                {setTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* search tips */}
            <button
              type="button"
              onClick={() =>
                openModal(<CardsSearchTipsModal />, {
                  contentClassName: 'w-full max-w-2xl',
                })
              }
              className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-600"
            >
              Tips
            </button>

            {/* advance search */}
            <button
              type="button"
              onClick={() =>
                openModal(
                  <CardsAdvancedSearchModal
                    initialExactCode={initialFilters.exactCode}
                    initialIncludeDigital={initialFilters.includeDigital}
                    initialSort={initialFilters.sort}
                    initialSetType={initialFilters.setType}
                    setTypeOptions={setTypeOptions}
                    onApply={({ exactCode, includeDigital, sort, setType }) => {
                      updateQueryParams({
                        code: exactCode,
                        includeDigital,
                        sort,
                        setType,
                        q: searchInput,
                      })
                    }}
                  />,
                  {
                    contentClassName: 'w-full max-w-3xl',
                  }
                )
              }
              className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-600"
            >
              Advanced search
            </button>
            {isRouting && <p className="self-center text-sm text-slate-400">Refreshing results...</p>}
          </div>
        </form>
      </div>

      <div className="overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="text-left text-xs capitalize text-slate-400">
              <tr>
                <th className="py-4">Set name</th>
                <th className=" py-4 text-right">Code</th>
                <th className=" py-4 text-right hidden md:table-cell">Cards</th>
                <th className=" py-4 text-right hidden md:table-cell">Release date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((set) => (
                <tr key={set.id} className="border-t border-white/8">
                  <td className="py-4">
                    <Link href={`/sets/${set.code}`} className="flex items-center gap-3 text-violet-200 hover:text-violet-100 hover:underline">
                      {set.icon_svg_uri ? (
                        <img
                          src={set.icon_svg_uri}
                          alt=""
                          className="h-6 w-6 rounded-sm bg-white/90 p-0.5"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-sm bg-white/10" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{set.name}</p>
                        {set.digital && <p className="text-xs text-cyan-300">Digital</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 text-right uppercase text-slate-200">{set.code}</td>
                  <td className="py-4 text-right text-slate-300 hidden md:table-cell">{set.card_count}</td>
                  <td className="py-4 text-right text-slate-300 hidden md:table-cell">
                    {set.released_at ? dateFormatter.format(new Date(set.released_at)) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!items.length && (
          <div className="px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">No sets found</h2>
            <p className="mt-3 text-sm text-slate-400">Try changing the keywords, set type, or advanced search filters.</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-white/8 px-6 py-6">
            <div ref={sentinelRef} />
            {isLoadingMore && <p className="text-sm text-slate-400">Loading more sets...</p>}
            {!isLoadingMore && hasMore && <p className="text-sm text-slate-500">Keep scrolling for the next result</p>}
            {loadMoreError && <p className="text-sm text-rose-300">{loadMoreError}</p>}
            {!hasMore && <p className="text-sm text-slate-500">All results have been displayed.</p>}
          </div>
        )}
      </div>
    </section>
  )
}
