'use client'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardCard from '../common/DashboardCard'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardDonut from '../common/DashboardDonut'
import DashboardTable from '../common/DashboardTable'
import DashboardLink from '../common/DashboardLink'
import DashboardStatus from '../common/DashboardStatus'

const units = [
  {
    name: 'Asshiddiqiyah 3 Putra',
    items: [
      ['MTs', '93,6%', '612', '24', '41', '94,1%', '95,0%', '188/200'],
      ['MA', '92,1%', '594', '24', '39', '93,2%', '94,1%', '176/192']
    ]
  },
  {
    name: 'Asshiddiqiyah 3 Putri',
    items: [
      ['MTs', '94,2%', '548', '24', '34', '95,3%', '95,7%', '164/176'],
      ['MA', '93,0%', '534', '22', '32', '93,1%', '94,2%', '156/168']
    ]
  },
  {
    name: 'Asshiddiqiyah 4',
    items: [
      ['SMP', '91,4%', '434', '16', '28', '92,0%', '93,5%', '126/136'],
      ['SMK', '90,2%', '476', '18', '32', '90,5%', '92,2%', '136/152']
    ]
  }
]

function Unit({ u }: any) {
  return (
    <DashboardCard sx={{ p: 1.1, height: 300 }}>
      <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center', mb: 1 }}>
        <i className='tabler-school' style={{ fontSize: 21, color: '#087443' }} />
        <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{u.name}</Typography>
      </Box>
      <Grid container spacing={0.8}>
        {u.items.map((x: any[]) => (
          <Grid key={x[0]} size={6}>
            <DashboardCard sx={{ p: 0.75, height: 240, bgcolor: '#fbfcfd' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 800 }}>{x[0]}</Typography>
              <Typography sx={{ fontSize: 8, color: '#667085', mt: 0.6 }}>Performa</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#087443' }}>{x[1]}</Typography>
              <DashboardStatus score={parseFloat(x[1])} />
              {[
                ['Santri', x[2]],
                ['Kelas', x[3]],
                ['Guru', x[4]],
                ['Absensi Santri', x[5]],
                ['Absensi Guru', x[6]],
                ['Jam Pelajaran', x[7]]
              ].map(m => (
                <Box key={m[0]} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                  <Typography sx={{ fontSize: 7 }}>{m[0]}</Typography>
                  <Typography sx={{ fontSize: 7, fontWeight: 800 }}>{m[1]}</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 1, height: 5, bgcolor: '#edf0f2', borderRadius: 99 }}>
                <Box sx={{ width: x[1], height: '100%', bgcolor: '#087443', borderRadius: 99 }} />
              </Box>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>
      <DashboardLink>Lihat Detail Unit</DashboardLink>
    </DashboardCard>
  )
}

export default function FormalDashboard() {
  return (
    <DashboardLayout>
      <DashboardSection>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.7 }}>
            <DashboardKpi
              title='Performa Indikator Pendidikan Formal'
              value='92,7%'
              performance
              status='BAIK SEKALI'
              progress={92.7}
              valueColor='#087443'
              iconColor='#087443'
              footer='↑ 2,4% dari periode lalu'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Total Santri Formal'
              value='2.184'
              subtitle='L 1.102  |  P 1.082'
              icon='tabler-users'
              iconColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Total Kelas'
              value='82'
              subtitle='MTs 24  |  MA 24  |  SMP 16  |  SMK 18'
              icon='tabler-book-2'
              iconColor='#246bc2'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Total Guru'
              value='146'
              subtitle='L 78  |  P 68'
              icon='tabler-user-star'
              iconColor='#7041a5'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Absensi Santri Hari Ini'
              value='93,5%'
              subtitle='2.043 dari 2.184 hadir'
              icon='tabler-circle-check'
              iconColor='#087443'
              valueColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Absensi Guru Hari Ini'
              value='94,2%'
              subtitle='137 dari 146 hadir'
              icon='tabler-user-check'
              iconColor='#f28c28'
              valueColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.7 }}>
            <DashboardKpi
              title='Jam Pelajaran Hari Ini'
              value='412'
              subtitle='Terlaksana 384 (93,2%)'
              icon='tabler-clock'
              iconColor='#dc3030'
            />
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={1}>
          {units.map(u => (
            <Grid key={u.name} size={{ xs: 12, lg: 3.2 }}>
              <Unit u={u} />
            </Grid>
          ))}
          <Grid size={{ xs: 12, lg: 2.4 }}>
            <DashboardCard sx={{ p: 1.2, height: 300 }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800 }}>Performa Indikator Pendidikan Formal</Typography>
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#087443 0 334deg,#f5c542 334deg 348deg,#dc3030 348deg 360deg)',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 23,
                      borderRadius: '50%',
                      bgcolor: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 17, fontWeight: 800 }}>92,7%</Typography>
                      <Typography sx={{ fontSize: 7 }}>BAIK SEKALI</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {[
                ['100%', 'ISTIMEWA'],
                ['90% - 99,9%', 'BAIK SEKALI'],
                ['80% - 89,9%', 'BAIK'],
                ['75% - 79,9%', 'CUKUP'],
                ['< 70%', 'KURANG BAIK']
              ].map((x, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.55 }}>
                  <Typography sx={{ fontSize: 7 }}>{x[0]}</Typography>
                  <Typography sx={{ fontSize: 7, fontWeight: 800 }}>{x[1]}</Typography>
                </Box>
              ))}
            </DashboardCard>
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardLineChart
              title='Tren Absensi Santri di Kelas (30 Hari Terakhir)'
              series={[
                { name: 'Hadir', color: '#087443', values: [97, 96, 98, 97, 98, 97, 98, 96, 97, 98] },
                { name: 'Izin', color: '#246bc2', values: [22, 23, 21, 22, 21, 23, 22, 21, 22, 23] },
                { name: 'Sakit', color: '#f28c28', values: [8, 7, 9, 8, 7, 8, 7, 8, 7, 8] },
                { name: 'Alpha', color: '#dc3030', values: [3, 3, 2, 3, 2, 3, 2, 3, 2, 3] }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardDonut
              title='Absensi Santri Hari Ini (Total)'
              total='2.184'
              totalLabel='Santri'
              items={[
                { label: 'Hadir', value: 2043, color: '#087443' },
                { label: 'Izin', value: 67, color: '#246bc2' },
                { label: 'Sakit', value: 38, color: '#f28c28' },
                { label: 'Alpha', value: 36, color: '#dc3030' }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardDonut
              title='Absensi Guru Hari Ini (Total)'
              total='146'
              totalLabel='Guru'
              items={[
                { label: 'Hadir', value: 137, color: '#087443' },
                { label: 'Izin', value: 5, color: '#246bc2' },
                { label: 'Sakit', value: 4, color: '#dc3030' }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardCard sx={{ p: 1.2, height: '100%' }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800 }}>AKSI CEPAT</Typography>
              <Grid container spacing={0.7} sx={{ mt: 1 }}>
                {[
                  ['tabler-users', 'Absensi Santri di Kelas'],
                  ['tabler-user-check', 'Absensi Guru'],
                  ['tabler-calendar', 'Jadwal Pelajaran'],
                  ['tabler-file-report', 'Nilai Akademik'],
                  ['tabler-file', 'Rapor Santri']
                ].map(x => (
                  <Grid key={x[1]} size={6}>
                    <Box
                      sx={{
                        height: 66,
                        border: '1px solid #e5e7eb',
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        p: 0.5
                      }}
                    >
                      <i className={x[0]} style={{ fontSize: 19, color: '#087443' }} />
                      <Typography sx={{ fontSize: 7 }}>{x[1]}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </DashboardCard>
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection title='Kelengkapan Raport'>
        <DashboardTable
          title='Status upload raport tahun ajaran 2025/2026 - semester genap'
          columns={['JENJANG', 'ASSHIDDIQIYAH 3 PUTRA', 'ASSHIDDIQIYAH 3 PUTRI', 'ASSHIDDIQIYAH 4']}
          rows={[
            ['MTs', '20/24 • 83,3%', '21/22 • 95,5%', 'SMP • 15/16 • 93,8%'],
            ['MA', '18/24 • 75,0%', '20/22 • 90,9%', 'SMK • 18/18 • 100%']
          ]}
        />
      </DashboardSection>
    </DashboardLayout>
  )
}
