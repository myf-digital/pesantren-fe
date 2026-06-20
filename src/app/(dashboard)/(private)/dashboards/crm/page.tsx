// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import CardStatVertical from '@/components/card-statistics/Vertical'
import FilterTanggal from './FilterTanggal'

// Third-party Imports
import { format, startOfMonth } from 'date-fns'

// Server Action Imports
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

const DashboardCRM = async (props: {
  searchParams: Promise<{ tanggal?: string; tanggal_mulai?: string; tanggal_selesai?: string }>
}) => {
  const searchParams = await props.searchParams
  const tanggal_mulai =
    searchParams.tanggal_mulai || searchParams.tanggal || format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const tanggal_selesai = searchParams.tanggal_selesai || searchParams.tanggal || format(new Date(), 'yyyy-MM-dd')

  // Vars
  const session = await getServerSession(authOptions)
  const token = session?.access_token

  let summaryData = {
    total_santri: { aktif: 0, keseluruhan: 0, persentase: 0 },
    total_guru_aktif: 0,
    total_pegawai_aktif: 0,
    total_absensi: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_absensi_kelas: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_temuan: 0,
    temuan_kotor: 0,
    temuan_rusak: 0,
    total_perizinan: 0,
    perizinan_menunggu: 0,
    perizinan_disetujui: 0,
    perizinan_overdue: 0
  }

  if (token) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/summary?tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store'
        }
      )
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
                Dashboard
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Data pesantren per rentang tanggal terpilih
              </Typography>
            </Box>
            <Box sx={{ width: 300 }}>
              <FilterTanggal tanggalMulai={tanggal_mulai} tanggalSelesai={tanggal_selesai} />
            </Box>
          </Box>
        </Card>
      </Grid>

      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Informasi Santri & Staf
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
          href={`/app/santri/list?status=1`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <CardStatVertical
          title='Total Guru Aktif'
          subtitle='Guru'
          stats={summaryData.total_guru_aktif.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-school'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/pegawai/list?status_pegawai=guru`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <CardStatVertical
          title='Total Pegawai Aktif'
          subtitle='Pegawai (Non-Guru)'
          stats={summaryData.total_pegawai_aktif.toLocaleString('id-ID')}
          avatarColor='success'
          avatarIcon='tabler-briefcase'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/pegawai/list?status_pegawai=pegawai`}
        />
      </Grid>

      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Absensi Kamar Santri
        </Typography>
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
          href={`/app/report/absen-harian-santri/list?status=Hadir&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Absensi Izin'
          subtitle='Santri Izin'
          stats={summaryData.total_absensi.izin.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.persentase_izin}%`}
          chipColor='info'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Izin&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Absensi Sakit'
          subtitle='Santri Sakit'
          stats={summaryData.total_absensi.sakit.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-user-exclamation'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.persentase_sakit}%`}
          chipColor='warning'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Sakit&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Absensi Alfa'
          subtitle='Santri Alfa'
          stats={summaryData.total_absensi.alfa.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.persentase_alfa}%`}
          chipColor='error'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Alfa&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>

      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Absensi Kelas Santri
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Absensi'
          subtitle='Kehadiran'
          stats={`${summaryData.total_absensi_kelas.persentase}%`}
          avatarColor='success'
          avatarIcon='tabler-calendar-user'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.hadir.toLocaleString('id-ID')} Hadir`}
          chipColor='success'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Hadir&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Absensi Izin'
          subtitle='Santri Izin'
          stats={summaryData.total_absensi_kelas.izin.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.persentase_izin}%`}
          chipColor='info'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Izin&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Absensi Sakit'
          subtitle='Santri Sakit'
          stats={summaryData.total_absensi_kelas.sakit.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-user-exclamation'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.persentase_sakit}%`}
          chipColor='warning'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Sakit&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Absensi Alfa'
          subtitle='Santri Alfa'
          stats={summaryData.total_absensi_kelas.alfa.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.persentase_alfa}%`}
          chipColor='error'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Alfa&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>

      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Temuan
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
        <CardStatVertical
          title='Temuan Kotor'
          subtitle='Laporan Kebersihan'
          stats={summaryData.temuan_kotor.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-trash'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/kebersihan-temuan/list?status_kondisi=KOTOR&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
        <CardStatVertical
          title='Temuan Rusak'
          subtitle='Laporan Kerusakan'
          stats={summaryData.temuan_rusak.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-tool'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/kebersihan-temuan/list?status_kondisi=RUSAK&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>

      {/* Group 4: Perizinan */}
      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Perizinan
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <CardStatVertical
          title='Perizinan Menunggu'
          subtitle='Menunggu Approval'
          stats={summaryData.perizinan_menunggu.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-hourglass'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/perizinan-santri/list?status=Menunggu&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <CardStatVertical
          title='Perizinan Disetujui'
          subtitle='Telah Disetujui'
          stats={summaryData.perizinan_disetujui.toLocaleString('id-ID')}
          avatarColor='success'
          avatarIcon='tabler-circle-check'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/perizinan-santri/list?status=Disetujui&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <CardStatVertical
          title='Perizinan Overdue'
          subtitle='Terlambat Kembali'
          stats={summaryData.perizinan_overdue.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-clock'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/perizinan-santri/list?kondisi=Overdue&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
        />
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
