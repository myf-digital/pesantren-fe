'use client'

import Box from '@mui/material/Box'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        background: '#fff',
        color: '#172033',
        px: { xs: 0.75, sm: 1.25, md: 1.5 },
        py: { xs: 0.75, md: 1.25 },
        fontFamily: 'inherit'
      }}
    >
      {children}
    </Box>
  )
}
