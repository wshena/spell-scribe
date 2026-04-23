'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'

const RouteLoadingBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentUrl = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUrlRef = useRef(currentUrl)

  const clearTimers = useEffectEvent(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current)
      finishTimeoutRef.current = null
    }
  })

  const startLoading = useEffectEvent(() => {
    clearTimers()
    setIsVisible(true)
    setProgress((prev) => (prev > 0 ? prev : 8))

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev
        return prev + Math.max(2, (92 - prev) * 0.12)
      })
    }, 120)
  })

  const finishLoading = useEffectEvent(() => {
    clearTimers()
    setProgress(100)

    finishTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      setProgress(0)
    }, 220)
  })

  useEffect(() => {
    if (lastUrlRef.current !== currentUrl) {
      const timeoutId = window.setTimeout(() => {
        finishLoading()
        lastUrlRef.current = currentUrl
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }
  }, [currentUrl])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-ignore-route-loading="true"]')) return

      const anchor = target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return
      if (anchor.getAttribute('target') === '_blank') return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const nextUrl = new URL(href, window.location.href)
      const current = new URL(window.location.href)

      if (nextUrl.origin !== current.origin) return
      if (`${nextUrl.pathname}${nextUrl.search}` === `${current.pathname}${current.search}`) return

      startLoading()
    }

    const handleFormSubmit = (event: SubmitEvent) => {
      const target = event.target
      if (!(target instanceof HTMLFormElement)) return

      const action = target.getAttribute('action')
      if (!action) {
        startLoading()
        return
      }

      const nextUrl = new URL(action, window.location.href)
      if (nextUrl.origin === window.location.origin) {
        startLoading()
      }
    }

    const handlePopState = () => {
      startLoading()
    }

    document.addEventListener('click', handleDocumentClick, true)
    document.addEventListener('submit', handleFormSubmit, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      document.removeEventListener('submit', handleFormSubmit, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-90 h-1 w-screen">
      <div
        className="h-full bg-purple-600 transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  )
}

export default RouteLoadingBar
