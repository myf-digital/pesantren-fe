'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DashboardCard from './DashboardCard'

export default function DashboardInfo({ children }: { children: React.ReactNode }) {
  return (
    <DashboardCard sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          bgcolor: '#e9f4ff',
          color: '#1769aa',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <i className='tabler-info-circle' style={{ fontSize: 12 }} />
      </Box>
      <Typography sx={{ fontSize: 10, color: '#344054' }}>{children}</Typography>
    </DashboardCard>
  )
}
