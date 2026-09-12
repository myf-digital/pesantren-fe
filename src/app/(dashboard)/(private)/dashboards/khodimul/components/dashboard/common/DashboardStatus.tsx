'use client'

import Box from '@mui/material/Box'

import { scoreColor, scoreStatus } from './dashboardTheme'

export default function DashboardStatus({ score }: { score: number }) {
  const color = scoreColor(score)

  const label = scoreStatus(score)

  return (
    <Box
      sx={{
        display: 'inline-block',
        p: 2,
        borderRadius: 0.7,
        fontSize: 10,
        fontWeight: 800,
        color,
        bgcolor: `${color}15`
      }}
    >
      {label}
    </Box>
  )
}
