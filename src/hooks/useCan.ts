'use client'

import { usePathname } from 'next/navigation'

import { can, normalizeResource } from '@/libs/permission'
import { usePermissionContext } from '@/contexts/PermissionContext'
import type { Ability } from '@/types/permission'

export function useCan(abilities: Ability | Ability[], path?: string) {
  const { permissions } = usePermissionContext()
  const pathname = usePathname()

  return can(permissions, normalizeResource(path || pathname), abilities)
}
