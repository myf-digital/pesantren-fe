import type { ReactNode } from 'react'

// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

const canAccessKhodimul = (allowedRoles: string[], roleName?: string) =>
  allowedRoles.includes('all') || allowedRoles.includes(String(roleName ?? '').trim().toLowerCase())

const KhodimulLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const allowedRoles = session?.dashboard_khodimul_roles ?? ['administrator']

  if (!canAccessKhodimul(allowedRoles, session?.userdata?.role_name)) {
    redirect('/dashboards/crm')
  }

  return <>{children}</>
}

export default KhodimulLayout
