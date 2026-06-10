'use client'

import { PermissionProvider } from '@/contexts/PermissionContext'
import { initOneSignal } from '@/libs/onesignal'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
  initialPermissions: Record<string, any>
}

export default function AppClientLayout({ children, initialPermissions }: Props) {
  useEffect(() => {
    initOneSignal()
  }, [])

  return <PermissionProvider initialPermissions={initialPermissions}>{children}</PermissionProvider>
}
