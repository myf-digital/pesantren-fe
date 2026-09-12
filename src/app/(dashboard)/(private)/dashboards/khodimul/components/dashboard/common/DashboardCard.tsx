'use client'

import Box from '@mui/material/Box'

export default function DashboardCard({
  children,
  sx
}: {
  children: React.ReactNode
  sx?: any
}) {
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(16,24,40,.035)',
        overflow: 'hidden',
        ...sx
      }}
    >
      {children}
    </Box>
  )
}
