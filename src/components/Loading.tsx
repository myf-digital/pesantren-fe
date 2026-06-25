'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { loading } from '@/libs/loading'

export default function TopProgressBar() {
  const [progress, setProgress] = useState(0)
  const [visibleAxios, setVisibleAxios] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const unsubLoad = loading.subscribe((state: boolean) => {
      setVisibleAxios(state)

      if (!state) {
        setProgress(100)
      } else {
        setProgress(10)
      }
    })

    const unsubProg = loading.onProgress((val: any) => {
      setProgress(val)
    })

    return () => {
      unsubLoad()
      unsubProg()
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (visibleAxios && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)

            return prev
          }

          const increment = Math.max((90 - prev) * 0.1, 1)

          return Math.min(prev + increment, 90)
        })
      }, 150)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [visibleAxios, progress])

  useEffect(() => {
    let clickNavigating = false

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    const handleNavigationStart = (href: string | null) => {
      if (clickNavigating) {
        clickNavigating = false
        return
      }

      if (href) {
        const currentUrl = window.location.pathname + window.location.search

        try {
          const targetUrl = new URL(href, window.location.href).pathname + new URL(href, window.location.href).search

          if (currentUrl !== targetUrl) {
            setTimeout(() => {
              setIsNavigating(true)
              setTimeout(() => setIsNavigating(false), 800)
            }, 10)
          }
        } catch {
          setTimeout(() => {
            setIsNavigating(true)
            setTimeout(() => setIsNavigating(false), 800)
          }, 10)
        }
      }
    }

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor) {
        const href = anchor.getAttribute('href')
        const targetAttr = anchor.getAttribute('target')

        if (href && href.startsWith('/') && !href.startsWith('/#') && targetAttr !== '_blank') {
          const currentUrl = window.location.pathname + window.location.search

          try {
            const targetUrl = new URL(href, window.location.href).pathname + new URL(href, window.location.href).search

            if (currentUrl !== targetUrl) {
              clickNavigating = true
              setIsNavigating(true)
            }
          } catch (error) {
            clickNavigating = true
            setIsNavigating(true)
          }
        }
      }
    }

    window.history.pushState = function (...args) {
      const href = args[2]

      handleNavigationStart(href ? href.toString() : null)

      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function (...args) {
      const href = args[2]

      handleNavigationStart(href ? href.toString() : null)

      return originalReplaceState.apply(this, args)
    }

    const handlePopState = () => {
      setIsNavigating(true)
    }

    document.addEventListener('click', handleAnchorClick)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      document.removeEventListener('click', handleAnchorClick)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  const showOverlay = isNavigating

  return (
    <>
      <div
        className='fixed top-0 left-0 h-[4px] bg-red-500 transition-all duration-200 z-[99999]'
        style={{
          width: `${progress}%`,
          opacity: visibleAxios ? 1 : 0
        }}
      />

      {showOverlay && (
        <div
          className='
            fixed inset-0 
            bg-[#01793c]/10
            backdrop-blur-[3px]
            z-[99998]
            flex flex-col items-center justify-center
            gap-4
            transition-opacity duration-200
          '
        >
          <img src='/sada/sada.png' alt='SADA Logo' width={85} height={85} className='pulse-logo' />
          <span className='text-sm font-bold text-primary drop-shadow-sm'>Memuat...</span>
        </div>
      )}
    </>
  )
}
