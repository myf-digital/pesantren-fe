import type { NextConfig } from 'next'
import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  scope: process.env.BASEPATH || '/',
})

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  assetPrefix: process.env.BASEPATH,
  output: 'standalone',

  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/dashboards/crm',
        permanent: true
      },
      {
        source: '/dashboards/analytics',
        destination: '/dashboards/crm',
        permanent: true
      }
    ]
  },

  eslint: {
    ignoreDuringBuilds: true
  }
}

export default withPWA(nextConfig)
