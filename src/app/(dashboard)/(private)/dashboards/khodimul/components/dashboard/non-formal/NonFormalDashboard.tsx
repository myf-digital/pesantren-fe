'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import Button from '@mui/material/Button'

import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardCard from '../common/DashboardCard'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardInfo from '../common/DashboardInfo'
import DashboardLink from '../common/DashboardLink'

const programs = [
  [
    'MDA',
    'Madrasah Diniyah Awaliyah',
    'tabler-building-mosque',
    '212',
    '24',
    '12',
    '93,5%',
    '94,2%',
    'Jam Pelajaran 62/66'
  ],
  ['AL-QURAN', 'Tahfidz & Tilawah', 'tabler-book', '212', '12', '14', '95,1%', '95,8%', 'Target Tilawah 92%'],
  ['FASHOLATAN', 'Hafalan & Praktek', 'tabler-pray', '106', '10', '8', '95,1%', '94,6%', 'Target Hafalan 91%'],
  ['BAHASA', 'Arab, Inggris, Jepang', 'tabler-message', '150', '8', '8', '95,0%', '94,5%', 'Target Percakapan 89%'],
  [
    'EKSTRAKURIKULER',
    'Pengembangan Minat & Bakat',
    'tabler-medal',
    '342',
    '8',
    '12',
    '93,2%',
    '96,2%',
    'Program Aktif 8/8'
  ]
]

const kelas: any = {
  MDA: 'Kelas/Group',
  'AL-QURAN': 'Halaqoh',
  FASHOLATAN: 'Kelompok',
  BAHASA: 'Kelas',
  EKSTRAKURIKULER: 'Jenis Ekskul'
}

function Program({ p }: any) {
  return (
    <DashboardCard sx={{ p: 1.05, height: 280, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{p[0]}</Typography>
      <Typography sx={{ fontSize: 11, color: '#667085', minHeight: 18 }}>{p[1]}</Typography>
      <Box
        sx={{
          width: 68,
          height: 68,
          mx: 'auto',
          my: 1.2,
          borderRadius: '50%',
          bgcolor: '#eaf6ef',
          border: '1px solid #cde6d7',
          display: 'grid',
          placeItems: 'center',
          color: '#087443'
        }}
      >
        <i className={p[2]} style={{ fontSize: 30 }} />
      </Box>
      {[
        ['Santri', p[3]],
        [kelas[p[0]], p[4]],
        ['Ustadz/Ustadzah', p[5]],
        ['Absensi Santri', p[6]],
        ['Absensi Ustadz', p[7]],
        ['Target/Program', p[8]]
      ].map(x => (
        <Box
          key={x[0]}
          sx={{ display: 'flex', justifyContent: 'space-between', py: 0.38, borderBottom: '1px solid #f0f1f3' }}
        >
          <Typography sx={{ fontSize: 10 }}>{x[0]}</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: x[0].includes('Absensi') ? '#087443' : '#172033' }}>
            {x[1]}
          </Typography>
        </Box>
      ))}
      <DashboardLink>Lihat Detail</DashboardLink>
    </DashboardCard>
  )
}

export default function NonFormalDashboard() {
  const router = useRouter()
  const [selected, setSelected] = useState<number>(0)

  const branchStats = [
    ['Asshiddiqiyah 3 Putra', '612', '24', '26', '94,1%', '95,0%', '188/200'],
    ['Asshiddiqiyah 3 Putri', '584', '22', '28', '95,3%', '95,7%', '184/176'],
    ['Asshiddiqiyah 4', '988', '18', '44', '92,8%', '94,8%', '144/152']
  ]

  return (
    <DashboardLayout>
      <Grid container spacing={4} sx={{ p: 2 }}>
        <Button
          variant='contained'
          size='small'
          color='primary'
          startIcon={<i className='tabler-chevron-left' />}
          onClick={() => router.push('/dashboards/khodimul')}
        >
          Back
        </Button>
      </Grid>
      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.7 }}>
            <DashboardKpi
              title='Performa Indikator Pendidikan Non Formal'
              value='92,8%'
              performance
              status='BAIK SEKALI'
              progress={92.8}
              valueColor='#087443'
              iconColor='#087443'
              footer='↑ 3,1% dari periode lalu'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Total Santri Non Formal'
              value='2.184'
              subtitle='L 1.102  |  P 1.082'
              icon='tabler-users'
              iconColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Total Kelas/Group'
              value='64'
              subtitle='Putra 32  |  Putri 32'
              icon='tabler-book-2'
              iconColor='#246bc2'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Total Ustadz/Ustadzah'
              value='98'
              subtitle='L 51  |  P 47'
              icon='tabler-user-star'
              iconColor='#7041a5'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Absensi Santri Hari Ini'
              value='93,7%'
              subtitle='2.046 dari 2.184 hadir'
              icon='tabler-circle-check'
              iconColor='#087443'
              valueColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Absensi Ustadz Hari Ini'
              value='95,2%'
              subtitle='86 dari 98 hadir'
              icon='tabler-user-check'
              iconColor='#f28c28'
              valueColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Jam Pelajaran Hari Ini'
              value='186'
              subtitle='Terlaksana 170 (91,4%)'
              icon='tabler-clock'
              iconColor='#dc3030'
            />
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.7, p: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>Pendidikan Non Formal</Typography>
          <Box sx={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
            {['Asshiddiqiyah 3 Putra', 'Asshiddiqiyah 3 Putri', 'Asshiddiqiyah 4'].map((x, i) => (
              <Box
                onClick={() => setSelected(i)}
                key={x}
                sx={{
                  px: 1.3,
                  py: 0.65,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: i === selected ? '#087443' : '#fff',
                  color: i === selected ? '#fff' : '#172033',
                  cursor: 'pointer'
                }}
              >
                {x}
              </Box>
            ))}
          </Box>
        </Box>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {programs.map(p => (
            <Grid key={p[0]} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Program p={p} />
            </Grid>
          ))}
        </Grid>
      </DashboardSection>

      <DashboardSection title='Kehadiran Santri Non Formal (30 Hari Terakhir)'>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {branchStats.map((b: any[]) => (
            <Grid key={b[0]} size={{ xs: 12, md: 4 }}>
              <DashboardCard sx={{ p: 1.05 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{b[0]}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#087443', fontWeight: 800 }}>Rata-rata {b[4]}</Typography>
                </Box>
                <DashboardLineChart
                  title=''
                  series={[
                    { name: 'Hadir', color: '#087443', values: [98, 97, 98, 97, 98, 97, 99, 98, 98, 97] },
                    { name: 'Izin', color: '#246bc2', values: [20, 21, 19, 20, 21, 20, 19, 21, 20, 20] },
                    { name: 'Sakit', color: '#f28c28', values: [5, 5, 6, 5, 4, 5, 5, 4, 5, 4] },
                    { name: 'Alpha', color: '#dc3030', values: [2, 2, 1, 2, 2, 1, 2, 1, 2, 1] }
                  ]}
                />
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
      </DashboardSection>
      <DashboardInfo>
        Performa dihitung dari rata-rata indikator utama pendidikan non formal berdasarkan standar penilaian pondok
        pesantren.
      </DashboardInfo>
    </DashboardLayout>
  )
}
