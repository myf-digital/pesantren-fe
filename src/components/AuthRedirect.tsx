'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Type Imports

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports

const AuthRedirect = () => {
  const pathname = usePathname()

  // ℹ️ Bring me `lang`
  const redirectUrl = `/login?redirectTo=${pathname}`
  const login = `/login`
  const homePage = themeConfig.homePageUrl

  const dashboardPages = [homePage, '/dashboards/crm', '/']

  return redirect(dashboardPages.includes(pathname) || pathname === login ? login : redirectUrl)
}

export default AuthRedirect
