// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import CardStatVertical from '@/components/card-statistics/Vertical'
import TableTemuan from '@/app/(dashboard)/(private)/app/report/kebersihan-temuan/list/page'
import AbsenHarian from '@/app/(dashboard)/(private)/app/report/absen-harian-santri/list/page'
import FilterTanggal from './FilterTanggal'

// Third-party Imports
import { format } from 'date-fns'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

const DashboardCRM = async (props: { searchParams: Promise<{ tanggal?: string }> }) => {
  const searchParams = await props.searchParams
  const tanggal = searchParams.tanggal || format(new Date(), 'yyyy-MM-dd')

  // Vars
  const serverMode = await getServerMode()
  const session = await getServerSession(authOptions)
  const token = session?.access_token

  let summaryData = {
    total_santri: { aktif: 0, keseluruhan: 0, persentase: 0 },
    total_absensi: { hadir: 0, persentase: 0 },
    total_temuan: 0,
    total_perizinan: 0
  }

  if (token) {
    try {
      const res = await fetch(`${process.env.API_URL}/summary?tanggal=${tanggal}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
      })
      const json = await res.json()
      if (json?.status && json?.data) {
        summaryData = json.data
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ p: 5 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                Ringkasan Dashboard
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Data pesantren per tanggal terpilih
              </Typography>
            </Box>
            <Box sx={{ width: 220 }}>
              <FilterTanggal currentTanggal={tanggal} />
            </Box>
          </Box>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Santri'
          subtitle='Santri Aktif'
          stats={summaryData.total_santri.aktif.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-users'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_santri.persentase}%`}
          chipColor='warning'
          chipVariant='tonal'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Absensi'
          subtitle='Kehadiran'
          stats={`${summaryData.total_absensi.persentase}%`}
          avatarColor='success'
          avatarIcon='tabler-calendar-user'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.hadir.toLocaleString('id-ID')} Hadir`}
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Temuan'
          subtitle='Temuan'
          stats={summaryData.total_temuan.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-alert-triangle'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Perizinan'
          subtitle='Perizinan Santri'
          stats={summaryData.total_perizinan.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-file-description'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <AbsenHarian />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <TableTemuan />
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
