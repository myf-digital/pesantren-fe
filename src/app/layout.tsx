// MUI Imports
import { cookies } from 'next/headers'

import { getToken } from 'next-auth/jwt'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import TopProgressBar from '@/components/Loading'
import AppClientLayout from './(dashboard)/(private)/AppClientLayout'

export const metadata = {
  title: 'SADA',
  description: "Sistem Administrasi Digital Asshiddiqiyah",
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#01793c'
}

const RootLayout = async (props: ChildrenType ) => {
  const { children } = props

  const systemMode = await getSystemMode()
  const direction = 'ltr'

  const token = await getToken({
    req: {
      cookies: await cookies()
    } as any,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <head>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
      </head>
      <body className='flex is-full min-bs-full flex-auto flex-col' suppressHydrationWarning>
        <TopProgressBar />
        <AppClientLayout initialPermissions={token?.permissions ?? {}}>
          {children}
        </AppClientLayout>
      </body>
    </html>
  )
}

export default RootLayout
