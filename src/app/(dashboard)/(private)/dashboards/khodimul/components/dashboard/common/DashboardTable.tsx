'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DashboardCard from './DashboardCard'

export default function DashboardTable({
  title,
  columns,
  rows
}: {
  title: string
  columns: string[]
  rows: (string | React.ReactNode)[][]
}) {
  return (
    <DashboardCard sx={{ p: 1.25, overflowX: 'auto' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 0.8 }}>{title}</Typography>
      <Box sx={{ minWidth: 760 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))`,
            borderBottom: '1px solid #e5e7eb',
            pb: 0.7
          }}
        >
          {columns.map(c => (
            <Typography key={c} sx={{ fontSize: 11, fontWeight: 800, color: '#667085' }}>
              {c}
            </Typography>
          ))}
        </Box>
        {rows.map((row, ri) => (
          <Box
            key={ri}
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))`,
              py: 0.8,
              borderBottom: '1px solid #f0f1f3',
              alignItems: 'center'
            }}
          >
            {row.map((cell, ci) => (
              <Typography key={ci} sx={{ fontSize: 10 }}>
                {cell}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </DashboardCard>
  )
}
