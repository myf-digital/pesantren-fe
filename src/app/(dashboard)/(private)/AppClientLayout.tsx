'use client'

import { PermissionProvider } from '@/contexts/PermissionContext'
import { initOneSignal } from '@/libs/onesignal'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
  initialPermissions: Record<string, any>
}

export default function AppClientLayout({ children, initialPermissions }: Props) {
  const router = useRouter()

  useEffect(() => {
    initOneSignal()

    // Listen for messages from service worker
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'NAVIGATE' && event.data?.targetUrl) {
          console.log('[SW MESSAGE]', event.data.targetUrl)
          router.push(event.data.targetUrl)
        }
      })
    }
  }, [])

  return <PermissionProvider initialPermissions={initialPermissions}>{children}</PermissionProvider>
}
