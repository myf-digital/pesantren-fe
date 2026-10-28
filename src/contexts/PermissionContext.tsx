'use client'

import { createContext, useContext, useState } from 'react'

import type { PermissionMap } from '@/types/permission'
import type { VerticalMenuDataType } from '@/types/menuTypes'

type PermissionContextType = {
  permissions: PermissionMap
  setPermissions: (p: PermissionMap) => void
  menuData: VerticalMenuDataType[]
  setMenuData: (m: VerticalMenuDataType[]) => void
}

const PermissionContext = createContext<PermissionContextType | null>(null)

export function PermissionProvider({
  children,
  initialPermissions
}: {
  children: React.ReactNode
  initialPermissions: PermissionMap
}) {
  const [permissions, setPermissions] = useState<PermissionMap>(initialPermissions)
  const [menuData, setMenuData] = useState<VerticalMenuDataType[]>([])

  return (
    <PermissionContext.Provider value={{ permissions, setPermissions, menuData, setMenuData }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissionContext() {
  const ctx = useContext(PermissionContext)

  if (!ctx) throw new Error('PermissionProvider missing')
    
  return ctx
}
