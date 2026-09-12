'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function DashboardSection({
  title,
  children,
  sx
}: {
  title?: string
  children: React.ReactNode
  sx?: any
}) {
  return (
    <Box sx={{ mb: 1.15, ...sx }}>
      {title && (
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 800,
            mb: 0.65,
            px: 0.35,
            textTransform: 'uppercase',
            color: '#172033'
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  )
}
