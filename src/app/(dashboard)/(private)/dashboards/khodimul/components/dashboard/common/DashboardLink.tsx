'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function DashboardLink({ children = 'Lihat Detail' }: { children?: React.ReactNode }) {
  return (
    <Box sx={{ mt: 1, pt: .8, borderTop: '1px solid #edf0f2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: .5, color: '#087443' }}>
      <Typography sx={{ fontSize: 8.5, fontWeight: 700 }}>{children}</Typography>
      <i className='tabler-arrow-right' style={{ fontSize: 13 }} />
    </Box>
  )
}
