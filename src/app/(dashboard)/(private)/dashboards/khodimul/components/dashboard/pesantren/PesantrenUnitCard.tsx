'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DashboardCard from '../common/DashboardCard'
import DashboardLink from '../common/DashboardLink'
import DashboardStatus from '../common/DashboardStatus'
import DashboardDonut from '../common/DashboardDonut'

export default function PesantrenUnitCard({ unit }: { unit: any }) {
  return (
    <DashboardCard sx={{ p: 1.15, height: 340 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <i className='tabler-building-mosque' style={{ fontSize: 30, color: '#087443' }} />
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{unit.name}</Typography>
          <Typography sx={{ fontSize: 11, color: '#667085' }}>{unit.subtitle}</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1,
          mb: 1,
          p: 0.6,
          bgcolor: '#f1f8f4',
          border: '1px solid #d4eadc',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
          Performa: <b>{unit.performance}%</b>
        </Typography>
        <DashboardStatus score={unit.performance} />
      </Box>

      <DashboardDonut title='Kehadiran' total={unit.attendance} totalLabel='' items={unit.absence} />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.7, mt: 1, mb: 3 }}>
        {unit.metrics.map((m: any) => (
          <Box key={m.label}>
            <Typography sx={{ fontSize: 8, color: '#667085' }}>{m.label}</Typography>
            <Typography sx={{ fontSize: 9, fontWeight: 800, mt: 0.2 }}>{m.value}</Typography>
            <Box sx={{ mt: 0.35, height: 4, bgcolor: '#edf0f2', borderRadius: 99 }}>
              <Box sx={{ width: `${m.progress}%`, height: '100%', bgcolor: '#087443', borderRadius: 99 }} />
            </Box>
          </Box>
        ))}
      </Box>
      <DashboardLink>Lihat Detail Unit</DashboardLink>
    </DashboardCard>
  )
}
